const express = require('express');
const nodemailer = require('nodemailer');
const { getEmailTemplate, getPlainTextTemplate } = require('../utils/emailTemplate');

const router = express.Router();

// Configure nodemailer with explicit SMTP settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Debug authentication endpoint
router.get('/debug-auth', async (req, res) => {
  console.log('🔍 Debug Authentication:');
  console.log('GMAIL_USER:', process.env.GMAIL_USER);
  console.log('GMAIL_PASS length:', process.env.GMAIL_PASS?.length);
  console.log('GMAIL_PASS first 4 chars:', process.env.GMAIL_PASS?.substring(0, 4));
  
  const testTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
  
  try {
    const verification = await testTransporter.verify();
    console.log('✅ Email verification successful');
    res.json({ success: true, verification });
  } catch (error) {
    console.error('❌ Email verification failed:', error);
    res.json({ success: false, error: error.message });
  }
});

// Test connection endpoint
router.get('/test-connection', async (req, res) => {
  console.log('Testing email connection...');
  console.log('Gmail User:', process.env.GMAIL_USER);
  console.log('Gmail Pass length:', process.env.GMAIL_PASS?.length);
  
  try {
    const verification = await transporter.verify();
    console.log('✅ Email connection successful:', verification);
    res.json({ success: true, message: 'Email configuration is working!' });
  } catch (error) {
    console.error('❌ Email connection failed:', {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Email configuration failed',
      error: error.message,
      code: error.code
    });
  }
});

// Extract company name from email
const extractCompanyFromEmail = (email) => {
  const domain = email.split('@')[1];
  if (!domain) return 'Your Company';
  
  const companyName = domain.split('.')[0];
  return companyName.charAt(0).toUpperCase() + companyName.slice(1);
};

// Extract name from email
// Smart name detection function
// Smart name detection function
const extractNameFromEmail = (email) => {
  const localPart = email.split('@')[0].toLowerCase();
  
  // Function to capitalize first letter
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  
  // Split email by common delimiters
  const parts = localPart.split(/[._-]/);
  
  // Check for HR/hiring related terms first
  const hrTerms = ['hr', 'hiring', 'recruit', 'talent', 'jobs', 'career', 'careers', 'employment', 
                   'admin', 'info', 'contact', 'support', 'team', 'office', 'manager'];
  
  for (const part of parts) {
    if (hrTerms.some(term => part.includes(term))) {
      return 'Hiring Team';
    }
  }
  
  // Function to check if a string looks like a human name
  const looksLikeHumanName = (str) => {
    // Remove numbers and check remaining length
    const cleanStr = str.replace(/\d/g, '');  // Fixed: single backslash
    
    // Must be at least 2 characters after removing numbers
    if (cleanStr.length < 2) return false;
    
    // Must not be more than 70% numbers
    const numberRatio = (str.length - cleanStr.length) / str.length;
    if (numberRatio > 0.7) return false;
    
    // Check for common non-name patterns
    const nonNamePatterns = [
      /^[a-z]+\d{3,}$/, // Fixed: single backslash - like 'user123', 'test1234'
      /^\d+[a-z]+$/, // Fixed: single backslash - like '123user'
      /^(test|demo|sample|example|temp|admin|info|no|reply|noreply)/, // common non-names
      /^[a-z]{1,2}$/, // single/double letters like 'a', 'ab'
      /^(www|web|mail|email|contact|support|help|service)/, // web-related terms
    ];
    
    for (const pattern of nonNamePatterns) {
      if (pattern.test(cleanStr)) return false;
    }
    
    // Check for vowel presence (most names have vowels)
    const hasVowel = /[aeiou]/.test(cleanStr);
    if (!hasVowel && cleanStr.length > 4) return false;
    
    // Check for reasonable consonant-vowel ratio
    const vowels = cleanStr.match(/[aeiou]/g) || [];
    const consonants = cleanStr.match(/[bcdfghjklmnpqrstvwxyz]/g) || [];
    
    // Too many consonants in a row might not be a name
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(cleanStr)) return false;
    
    return true;
  };
  
  // Look for potential name in email parts
  let potentialName = null;
  
  for (const part of parts) {
    if (part.length >= 3 && looksLikeHumanName(part)) {
      // Prefer longer, more name-like parts
      if (!potentialName || part.length > potentialName.length) {
        potentialName = part;
      }
    }
  }
  
  // If we found a potential name, return it
  if (potentialName) {
    // Clean the name (remove numbers from end)
    const cleanName = potentialName.replace(/\d+$/, ''); // Fixed: single backslash
    return capitalize(cleanName);
  }
  
  // Special case: if email has firstname.lastname pattern, try to use first part
  if (parts.length === 2 && parts[0].length >= 3 && parts[1].length >= 3) {
    if (looksLikeHumanName(parts[0])) {
      return capitalize(parts[0].replace(/\d+$/, '')); // Fixed: single backslash
    }
  }
  
  // Default to Hiring Team if no recognizable name found
  return 'Hiring Team';
};

 

// Send single email
router.post('/send-email', async (req, res) => {
  console.log('📧 Received send-email request:', req.body);
  
  try {
    const { email, name, company, area } = req.body;
    
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address provided');
    }
    
    const recipientName = name || extractNameFromEmail(email);
    const recipientCompany = company || extractCompanyFromEmail(email);
    const jobArea = area || 'Full Stack Developer';

    console.log('📝 Email details:', {
      to: email,
      name: recipientName,
      company: recipientCompany,
      area: jobArea
    });

    const mailOptions = {
      from: `Danish Abdullah <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Application for ${jobArea} - ${recipientCompany}`,
      html: getEmailTemplate(recipientName, recipientCompany, jobArea),
      text: getPlainTextTemplate(recipientName, recipientCompany, jobArea)
    };

    console.log('🚀 Attempting to send email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    
    res.json({ 
      success: true, 
      message: `Email sent successfully to ${email}`,
      messageId: result.messageId,
      recipient: { email, name: recipientName, company: recipientCompany }
    });
    
  } catch (error) {
    console.error('❌ Error sending email:', {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message,
      code: error.code
    });
  }
});

// Send bulk emails
router.post('/send-bulk-emails', async (req, res) => {
  console.log('📧 Received bulk email request:', req.body);
  
  try {
    const { emails, area } = req.body;
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw new Error('No emails provided or invalid format');
    }
    
    const results = [];
    
    for (const emailData of emails) {
      try {
        const { email } = emailData;
        
        if (!email || !email.includes('@')) {
          throw new Error('Invalid email address');
        }
        
        const recipientName = emailData.name || extractNameFromEmail(email);
        const recipientCompany = emailData.company || extractCompanyFromEmail(email);
        const jobArea = area || 'Full Stack Developer';

        console.log(`📝 Processing email: ${email}`);

        const mailOptions = {
          from: `Danish Abdullah <${process.env.GMAIL_USER}>`,
          to: email,
          subject: `Application for ${jobArea} - ${recipientCompany}`,
          html: getEmailTemplate(recipientName, recipientCompany, jobArea),
          text: getPlainTextTemplate(recipientName, recipientCompany, jobArea)
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email}:`, result.messageId);
        
        results.push({
          email,
          name: recipientName,
          company: recipientCompany,
          status: 'sent',
          message: 'Email sent successfully',
          messageId: result.messageId
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Failed to send to ${emailData.email}:`, error.message);
        results.push({
          email: emailData.email,
          status: 'failed',
          message: error.message
        });
      }
    }
    
    console.log('📊 Bulk email results:', {
      total: emails.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length
    });
    
    res.json({ 
      success: true, 
      results,
      summary: {
        total: emails.length,
        sent: results.filter(r => r.status === 'sent').length,
        failed: results.filter(r => r.status === 'failed').length
      }
    });
    
  } catch (error) {
    console.error('❌ Error in bulk email sending:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send bulk emails',
      error: error.message 
    });
  }
});

module.exports = router;
