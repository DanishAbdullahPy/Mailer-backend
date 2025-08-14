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
// Enhanced company extraction
const extractCompanyFromEmail = (email) => {
  const domain = email.split('@')[1];
  if (!domain) return 'Your Company';
  
  const companyName = domain.split('.')[0];
  
  // Handle common email providers better
  const emailProviders = {
    'gmail': 'Gmail',
    'yahoo': 'Yahoo',
    'outlook': 'Outlook', 
    'hotmail': 'Hotmail',
    'aol': 'AOL',
    'icloud': 'iCloud'
  };
  
  if (emailProviders[companyName.toLowerCase()]) {
    return emailProviders[companyName.toLowerCase()];
  }
  
  // Clean up company name
  const cleanCompanyName = companyName
    .replace(/[0-9]/g, '') // Remove numbers
    .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
    .trim();
  
  // Capitalize properly
  return cleanCompanyName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};


// Enhanced smart name detection function
// Enhanced smart name detection function
const extractNameFromEmail = (email) => {
  const localPart = email.split('@')[0].toLowerCase();
  
  // Function to capitalize first letter
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  
  // Split email by common delimiters
  const parts = localPart.split(/[._-]/);
  
  // Check for HR/hiring related terms first
  const hrTerms = ['hr', 'hiring', 'recruit', 'talent', 'jobs', 'career', 'careers', 'employment', 
                   'admin', 'info', 'contact', 'support', 'team', 'office', 'manager', 'noreply', 'no-reply'];
  
  for (const part of parts) {
    if (hrTerms.some(term => part.includes(term))) {
      return 'Hiring Team';
    }
  }
  
  // Function to check if a string looks like a human name
  const looksLikeHumanName = (str) => {
    // Remove numbers and check remaining length
    const cleanStr = str.replace(/\d/g, '');
    
    // Must be at least 3 characters after removing numbers (increased from 2)
    if (cleanStr.length < 3) return false;
    
    // Must not be more than 50% numbers (reduced from 70%)
    const numberRatio = (str.length - cleanStr.length) / str.length;
    if (numberRatio > 0.5) return false;
    
    // Check for common non-name patterns
    const nonNamePatterns = [
      /^[a-z]+\d{3,}$/, // like 'user123', 'test1234'
      /^\d+[a-z]+$/, // like '123user'
      /^(test|demo|sample|example|temp|admin|info|no|reply|noreply|web|mail|email)/, // common non-names
      /^[a-z]{1,2}$/, // single/double letters like 'a', 'ab'
      /^(www|web|mail|email|contact|support|help|service|labs|lab|dev|api)/, // web-related terms
    ];
    
    for (const pattern of nonNamePatterns) {
      if (pattern.test(cleanStr)) return false;
    }
    
    // Check for vowel presence (most names have vowels)
    const hasVowel = /[aeiou]/.test(cleanStr);
    if (!hasVowel && cleanStr.length > 4) return false;
    
    // Too many consonants in a row might not be a name
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(cleanStr)) return false;
    
    // Check if it looks like a brand/company name (like 'danishlabs')
    if (cleanStr.includes('labs') || cleanStr.includes('tech') || cleanStr.includes('dev') || 
        cleanStr.includes('corp') || cleanStr.includes('inc') || cleanStr.includes('ltd')) {
      return false;
    }
    
    return true;
  };
  
  // Look for potential name in email parts - prioritize actual names over company-like terms
  let potentialName = null;
  
  for (const part of parts) {
    if (part.length >= 3 && looksLikeHumanName(part)) {
      // Clean the part and check if it's still a good name
      const cleanPart = part.replace(/\d+$/, '');
      
      // Prefer shorter, more name-like parts over longer company-like ones
      if (cleanPart.length <= 12 && cleanPart.length >= 3) {
        if (!potentialName || (cleanPart.length < potentialName.length && cleanPart.length >= 4)) {
          potentialName = cleanPart;
        }
      }
    }
  }
  
  // If we found a potential name, return it
  if (potentialName) {
    return capitalize(potentialName);
  }
  
  // Special case: if email has firstname.lastname pattern, try to use first part
  if (parts.length === 2 && parts[0].length >= 3 && parts[1].length >= 3) {
    const firstPart = parts[0].replace(/\d+$/, '');
    if (looksLikeHumanName(firstPart) && firstPart.length <= 10) {
      return capitalize(firstPart);
    }
  }
  
  // Check if the first part might be a name (even if it failed other tests)
  const firstPart = parts[0].replace(/\d+$/, '');
  if (firstPart.length >= 4 && firstPart.length <= 10 && /[aeiou]/.test(firstPart)) {
    // Check if it's not obviously a company term
    if (!/(lab|tech|dev|corp|inc|ltd|web|mail|info|admin)/.test(firstPart)) {
      return capitalize(firstPart);
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
