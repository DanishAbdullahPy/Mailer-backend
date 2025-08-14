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

// Enhanced company extraction with better logic
const extractCompanyFromEmail = (email) => {
  const localPart = email.split('@')[0];
  const domain = email.split('@')[1];
  if (!domain) return 'Your Company';
  
  const domainName = domain.split('.')[0].toLowerCase();
  const localLower = localPart.toLowerCase();
  
  // Handle common email providers - but check if local part has company info
  const emailProviders = ['gmail', 'yahoo', 'outlook', 'hotmail', 'aol', 'icloud', 'live', 'msn'];
  
  if (emailProviders.includes(domainName)) {
    // If it's a common email provider, try to extract company from local part
    const localParts = localPart.split(/[._-]/);
    
    // Look for company-like terms in local part
    for (const part of localParts) {
      const cleanPart = part.toLowerCase();
      
      // Skip if it looks like a person's name (simple heuristic)
      if (cleanPart.length <= 10 && /^[a-z]+$/.test(cleanPart) && 
          !/^(test|demo|sample|admin|info|contact|support|help|service|web|mail|email)/.test(cleanPart)) {
        continue; // Skip likely personal names
      }
      
      // Check for company indicators
      if (cleanPart.includes('corp') || cleanPart.includes('inc') || cleanPart.includes('ltd') ||
          cleanPart.includes('llc') || cleanPart.includes('tech') || cleanPart.includes('labs') ||
          cleanPart.includes('dev') || cleanPart.includes('solutions') || cleanPart.includes('systems') ||
          cleanPart.includes('group') || cleanPart.includes('company') || cleanPart.includes('firm') ||
          cleanPart.includes('agency') || cleanPart.includes('studio') || cleanPart.includes('works') ||
          part.length > 12) {
        
        let companyName = part
          .replace(/[0-9]/g, '')
          .replace(/[-_]/g, ' ')
          .trim();
        
        if (companyName.length >= 3) {
          return companyName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }
      }
    }
    
    // If no company found in local part, check if entire local part looks like company
    if (localPart.length > 8 || localParts.length > 2) {
      const mainPart = localParts[0];
      if (mainPart.length > 6) {
        return mainPart.charAt(0).toUpperCase() + mainPart.slice(1).toLowerCase();
      }
    }
    
    // Default to the email provider name with better formatting
    const providerNames = {
      'gmail': 'Gmail',
      'yahoo': 'Yahoo',
      'outlook': 'Outlook', 
      'hotmail': 'Hotmail',
      'aol': 'AOL',
      'icloud': 'iCloud',
      'live': 'Live',
      'msn': 'MSN'
    };
    
    return providerNames[domainName] || 'Your Company';
  }
  
  // For business domains, use the domain name
  const companyName = domainName
    .replace(/[0-9]/g, '')
    .replace(/[-_]/g, ' ')
    .trim();
  
  return companyName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Enhanced smart name detection function
const extractNameFromEmail = (email) => {
  const localPart = email.split('@')[0].toLowerCase();
  
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const parts = localPart.split(/[._-]/);
  
  // Check for HR/hiring related terms first
  const hrTerms = ['hr', 'hiring', 'recruit', 'talent', 'jobs', 'career', 'careers', 'employment', 
                   'admin', 'info', 'contact', 'support', 'team', 'office', 'manager', 'noreply', 'no-reply'];
  
  for (const part of parts) {
    if (hrTerms.some(term => part.includes(term))) {
      return 'Hiring Team';
    }
  }
  
  const looksLikeHumanName = (str) => {
    const cleanStr = str.replace(/\d/g, '');
    
    if (cleanStr.length < 3) return false;
    
    const numberRatio = (str.length - cleanStr.length) / str.length;
    if (numberRatio > 0.5) return false;
    
    const nonNamePatterns = [
      /^[a-z]+\d{3,}$/,
      /^\d+[a-z]+$/,
      /^(test|demo|sample|example|temp|admin|info|no|reply|noreply|web|mail|email)/,
      /^[a-z]{1,2}$/,
      /^(www|web|mail|email|contact|support|help|service|labs|lab|dev|api)/,
    ];
    
    for (const pattern of nonNamePatterns) {
      if (pattern.test(cleanStr)) return false;
    }
    
    const hasVowel = /[aeiou]/.test(cleanStr);
    if (!hasVowel && cleanStr.length > 4) return false;
    
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(cleanStr)) return false;
    
    if (cleanStr.includes('labs') || cleanStr.includes('tech') || cleanStr.includes('dev') || 
        cleanStr.includes('corp') || cleanStr.includes('inc') || cleanStr.includes('ltd')) {
      return false;
    }
    
    return true;
  };
  
  let potentialName = null;
  
  for (const part of parts) {
    if (part.length >= 3 && looksLikeHumanName(part)) {
      const cleanPart = part.replace(/\d+$/, '');
      
      if (cleanPart.length <= 12 && cleanPart.length >= 3) {
        if (!potentialName || (cleanPart.length < potentialName.length && cleanPart.length >= 4)) {
          potentialName = cleanPart;
        }
      }
    }
  }
  
  if (potentialName) {
    return capitalize(potentialName);
  }
  
  if (parts.length === 2 && parts[0].length >= 3 && parts[1].length >= 3) {
    const firstPart = parts[0].replace(/\d+$/, '');
    if (looksLikeHumanName(firstPart) && firstPart.length <= 10) {
      return capitalize(firstPart);
    }
  }
  
  const firstPart = parts[0].replace(/\d+$/, '');
  if (firstPart.length >= 4 && firstPart.length <= 10 && /[aeiou]/.test(firstPart)) {
    if (!/(lab|tech|dev|corp|inc|ltd|web|mail|info|admin)/.test(firstPart)) {
      return capitalize(firstPart);
    }
  }
  
  return 'Hiring Team';
};

// Send single email - UPDATED to accept company from frontend
router.post('/send-email', async (req, res) => {
  console.log('📧 Received send-email request:', req.body);
  
  try {
    const { email, name, company, area } = req.body;
    
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address provided');
    }
    
    // Use provided data or fallback to auto-extraction
    const recipientName = name || extractNameFromEmail(email);
    const recipientCompany = company || extractCompanyFromEmail(email);
    const jobArea = area || 'Full Stack Developer';

    console.log('📝 Email details:', {
      to: email,
      name: recipientName,
      company: recipientCompany,
      area: jobArea,
      providedByUser: { name: !!name, company: !!company }
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

// Send bulk emails - UPDATED to accept company data from frontend
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
        const { email, name, company } = emailData; // Now accepting name and company from frontend
        
        if (!email || !email.includes('@')) {
          throw new Error('Invalid email address');
        }
        
        // Use provided data or fallback to auto-extraction
        const recipientName = name || extractNameFromEmail(email);
        const recipientCompany = company || extractCompanyFromEmail(email);
        const jobArea = area || 'Full Stack Developer';

        console.log(`📝 Processing email: ${email}`, {
          providedName: !!name,
          providedCompany: !!company,
          finalName: recipientName,
          finalCompany: recipientCompany
        });

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
