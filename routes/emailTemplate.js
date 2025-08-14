const getEmailTemplate = (name, company, area) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Danish Abdullah · Full Stack Developer</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #ffffff;
      padding: 20px;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 32px;
    }
    
    .header {
      margin-bottom: 24px;
    }
    
    .greeting {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #111827;
    }
    
    .subtitle {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 24px;
    }
    
    .content {
      font-size: 16px;
      margin-bottom: 32px;
    }
    
    .content p {
      margin-bottom: 16px;
    }
    
    .highlight {
      font-weight: 600;
      color: #2563eb;
    }
    
    .links {
      display: flex;
      gap: 16px;
      margin: 24px 0;
      flex-wrap: wrap;
    }
    
    .link {
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
      padding: 8px 16px;
      border: 1px solid #e4e4e7;
      border-radius: 6px;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    
    .link:hover {
      background-color: #f8fafc;
      border-color: #2563eb;
    }
    
    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 24px 0;
    }
    
    .tech-tag {
      background-color: #f1f5f9;
      color: #475569;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 500;
    }
    
    .signature {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e4e4e7;
      font-size: 14px;
    }
    
    .signature-name {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    @media (max-width: 600px) {
      body {
        padding: 10px;
      }
      .container {
        padding: 20px;
      }
      .links {
        flex-direction: column;
      }
      .link {
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="greeting">Hi ${name || 'there'} 👋</div>
      <div class="subtitle">Hope you're having a great day!</div>
    </div>
    
    <div class="content">
      <p>I wanted to reach out about the <span class="highlight">${area || 'Full Stack Developer'}</span> role at <span class="highlight">${company || 'your company'}</span>. I've been following your work and really admire what you're building.</p>
      
      <p>In my recent projects, I've:</p>
      <ul style="margin-left: 20px; margin-bottom: 16px;">
        <li>Streamlined a e-com pharma B2C backend system</li>
        <li>Built Realtime FIR data dashboard for Delhi Police used during real incidents</li>
        <li>Modernized Central government systems to make them more searchable and efficient</li>
      </ul>
      
      <p>I genuinely enjoy solving real problems and building tools that make a meaningful impact — that's what draws me to your team.</p>
      
      <p>Would love to connect if this feels like a potential match. Thanks for your time!</p>
    </div>
    
    <div class="links">
      <a href="https://drive.google.com/drive/u/0/folders/1PmsRBzyB2bMdQzVFntOcBb5Za7WrA2w6" class="link">
        📄 Resume
      </a>
      <a href="https://linkedin.com/in/danish-abdullah-268214214/" class="link">
        💼 LinkedIn
      </a>
      <a href="https://github.com/DanishAbdullahPy" class="link">
        🔗 GitHub
      </a>
    </div>
    
    <div class="tech-stack">
      <span class="tech-tag">React</span>
      <span class="tech-tag">Node.js</span>
      <span class="tech-tag">PostgreSQL</span>
      <span class="tech-tag">Azure</span>
      <span class="tech-tag">Redux</span>
      <span class="tech-tag">APIs</span>
    </div>
    
    <div class="signature">
      <div class="signature-name">Danish Abdullah</div>
      <div>Full Stack Developer</div>
      <div>
        <a href="mailto:danishabdullah276@gmail.com" class="link" style="padding: 0; border: none;">danishabdullah276@gmail.com</a>
      </div>
    </div>
  </div>
</body>
</html>
`;

const getPlainTextTemplate = (name, company, area) => `
Hi ${name || 'there'},

Hope you're having a great day!

I wanted to reach out about the ${area || 'Full Stack Developer'} role at ${company || 'your company'}. I've been following your work and really admire what you're building.

In my recent projects, I've:
- Streamlined a e-com pharma B2C backend system
- Built Realtime FIR data dashboard for Delhi Police used during real incidents
- Modernized Central government systems to make them more searchable and efficient

I genuinely enjoy solving real problems and building tools that make a meaningful impact — that's what draws me to your team.

Would love to connect if this feels like a potential match. Thanks for your time!

Links:
Resume: https://drive.google.com/drive/u/0/folders/1PmsRBzyB2bMdQzVFntOcBb5Za7WrA2w6
LinkedIn: https://linkedin.com/in/danish-abdullah-268214214/
GitHub: https://github.com/DanishAbdullahPy

Tech Stack: React, Node.js, PostgreSQL, Azure, Redux, APIs

Best regards,
Danish Abdullah
Full Stack Developer
danishabdullah276@gmail.com
`;

module.exports = { getEmailTemplate, getPlainTextTemplate };
