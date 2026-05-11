import messageModel from "../models/message.models.js";
import chatModel from "../models/chat.models.js";
import { getAiResponse } from "../service/ai.service.js";
import { processPdf, getPdfAnswer } from "../service/pdfchat.service.js";
import nodemailer from "nodemailer";
/**
 * 🔹 Send Message
 * POST /api/message
 */
export const sendMessage = async (req, res) => {
  try {
    const { chatId, content, type } = req.body;
    const userId = req.user._id;

    // 🔐 Check chat ownership
    const chat = await chatModel.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or unauthorized",
      });
    }

    // ✅ Save user message
    const userMessage = await messageModel.create({
      chatId,
      sender: "user",
      type: type || "text",
      content: content || "",
    });

    //email automation
    // 🔥 EMAIL INTENT DETECTION - More flexible detection
    const emailKeywords = [
      "send mail",
      "send email",
      "send an email",
      "email to",
      "mail to",
    ];
    const isEmailIntent = emailKeywords.some((keyword) =>
      content.toLowerCase().includes(keyword),
    );

    if (isEmailIntent) {
      // 🔥 Extract email details using AI
      const extractionPrompt = `Extract email details from this user message and return ONLY valid JSON:

User message: "${content}"

Instructions:
- Extract the recipient email address (required)
- Extract or generate a subject line (if missing, create one based on content)
- Extract or generate the message body (if missing, create one based on subject)
- Keep the message professional and concise
- Ensure the email address is valid format

Return ONLY this exact JSON format:
{
  "to": "recipient@example.com",
  "subject": "Subject line here",
  "message": "Message body here"
}

Do not include any other text or explanations.`;

      const aiExtract = await getAiResponse([
        { role: "user", parts: [{ text: extractionPrompt }] },
      ]);

      let emailData;
      try {
        // Try to extract JSON from AI response more robustly
        let jsonText = aiExtract.trim();

        // Remove any markdown code blocks if present
        jsonText = jsonText.replace(/```json\s*/i, "").replace(/```\s*$/, "");

        // Find JSON object boundaries
        const startIndex = jsonText.indexOf("{");
        const endIndex = jsonText.lastIndexOf("}");

        if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
          throw new Error("No JSON object found in AI response");
        }

        const jsonString = jsonText.substring(startIndex, endIndex + 1);
        emailData = JSON.parse(jsonString);

        // Validate required fields
        if (!emailData.to || typeof emailData.to !== "string") {
          throw new Error("Missing or invalid recipient email");
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailData.to.trim())) {
          throw new Error("Invalid email format");
        }

        // Ensure subject exists
        emailData.subject = (emailData.subject || "").trim();
        if (!emailData.subject) {
          emailData.subject = "Message from Chat Agent";
        }

        // Ensure message exists and is not empty
        emailData.message = (emailData.message || "").trim();
        if (!emailData.message) {
          emailData.message = "Please find the message attached.";
        }

        // Clean up the data
        emailData.to = emailData.to.trim();
        emailData.subject = emailData.subject.trim();
        emailData.message = emailData.message.trim();
      } catch (err) {
        console.error("Email extraction error:", err.message);
        return res.status(200).json({
          success: false,
          message: `Could not extract email details: ${err.message}`,
        });
      }

      // 🔥 Save AI confirmation message
      const botMessage = await messageModel.create({
        chatId,
        sender: "model",
        type: "text",
        content: `📧 **Email Confirmation**\n\nI detected you want to send an email. Here are the details I extracted:\n\n**To:** ${emailData.to}\n**Subject:** ${emailData.subject}\n**Message:**\n${emailData.message}\n\nPlease confirm if you'd like me to send this email.`,
      });

      return res.status(200).json({
        success: true,
        action: "confirm_email",
        data: emailData,
        messages: {
          userMessage,
          botMessage,
        },
      });
    }

    // 🔥 Decide response type (RAG or Normal)
    let aiReply = "";

    if (chat.pdfUrl && chat.isPdfProcessed) {
      // ============================
      // 🔥 PDF CHAT (RAG)
      // ============================
      aiReply = await getPdfAnswer(chatId, content);
    } else {
      // ============================
      // 🔥 NORMAL CHAT (Gemini)
      // ============================

      // short-term memory
      const chatHistory = (
        await messageModel.find({ chatId }).sort({ createdAt: -1 }).limit(10)
      ).reverse();

      const systemPrompt = {
        role: "user",
        parts: [
          {
            text: "You are a helpful AI assistant. Answer only the user's latest question clearly. Do not mention previous messages, repetitions, or any issues. Keep the response direct and concise.",
          },
        ],
      };

      const messages = [
        systemPrompt,
        ...chatHistory.map((msg) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
        {
          role: "user",
          parts: [{ text: content }],
        },
      ];

      aiReply = await getAiResponse(messages);
    }

    // ✅ Save AI response
    const botMessage = await messageModel.create({
      chatId,
      sender: "model",
      type: "text",
      content: aiReply,
    });

    return res.status(201).json({
      success: true,
      data: {
        userMessage,
        botMessage,
      },
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

/**
 * 🔹 Get Messages
 */
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await chatModel.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or unauthorized",
      });
    }

    const messages = await messageModel.find({ chatId }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get Messages Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

/**
 * 🔹 Upload PDF
 */
export const uploadPdf = async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.user._id;

    const chat = await chatModel.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or unauthorized",
      });
    }

    const file = req.file;
    console.log("Uploaded file:", file);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const fileUrl = file.path;
    console.log("Uploaded PDF URL:", fileUrl);
    // ✅ Save PDF message
    await messageModel.create({
      chatId,
      sender: "user",
      type: "pdf",
      fileUrl,
      fileName: file.originalname,
    });

    // ✅ Update chat
    chat.pdfUrl = fileUrl;
    chat.isPdfProcessed = false;
    await chat.save();

    // 🔥 Process PDF ONLY ONCE
    await processPdf(chatId, fileUrl);

    chat.isPdfProcessed = true;
    await chat.save();

    return res.status(200).json({
      success: true,
      message: "PDF uploaded successfully",
      data: { fileUrl },
    });
  } catch (error) {
    console.error("Upload PDF Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload PDF",
    });
  }
};

export const sendEmail = async (req, res) => {
  try {
    const { chatId, to, subject, message } = req.body;

    const userEmail = req.user.email;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing email fields",
      });
    }

    //create transporter object
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${req.user.name}" <no-reply@nexaai.com>`,
      to,
      subject: subject || "No Subject",

      text: message,
      html: `
<div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f1f5f9; padding: 40px 20px;">
  
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #111827, #1f2937); color: #ffffff; padding: 18px 24px;">
      <p style="margin: 0; font-size: 13px; letter-spacing: 1px; opacity: 0.8;">MESSAGE</p>
      <h2 style="margin: 4px 0 0; font-size: 18px; font-weight: 600;">New Communication</h2>
    </div>

    <!-- Body -->
    <div style="padding: 28px; color: #374151; line-height: 1.7; font-size: 15px;">
      
      <p style="margin-bottom: 18px;">Dear Recipient,</p>

      <!-- Message Box -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 8px;">
        <p style="margin: 0; white-space: pre-line; color: #111827;">
          ${message}
        </p>
      </div>

      <p style="margin-top: 28px; margin-bottom: 6px;">Best regards,</p>

<div style="margin-top: 8px;">
  <p style="margin: 0; font-weight: 600; font-size: 15px; color: #111827;">
    ${req.user.name}
  </p>
  <p style="margin: 2px 0 0; font-size: 13px; color: #6b7280;">
    ${req.user.email}
  </p>
</div>

    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 14px; text-align: center; font-size: 12px; color: #6b7280;">
      Please do not reply directly to this email.
    </div>

  </div>

</div>
`,
    };

    //send email
    await transporter.sendMail(mailOptions);

    // save success message in chat
    const botMessage = await messageModel.create({
      chatId,
      sender: "model",
      type: "text",
      content: `✅ Your message has been sent to ${to} successfully`,
    });

    // response
    return res.status(200).json({
      success: true,
      message: `✅ Your message has been sent to ${to} successfully`,
      data: { botMessage },
    });
  } catch (error) {
    console.error("Send Email Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
};
