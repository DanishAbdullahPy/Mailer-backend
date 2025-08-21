const getEmailBody = (name, company, area) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Danish Abdullah · Full Stack Developer</title>
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f8fafc;
      padding: 16px;
      margin: 0;
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body {
        color: #e4e4e7;
        background-color: #0f172a;
      }
      .container {
        background-color: #1e293b !important;
        border-color: #334155 !important;
      }
      .text-muted {
        color: #94a3b8 !important;
      }
      .link {
        color: #60a5fa !important;
        border-color: #334155 !important;
      }
      .link:hover {
        color: #93c5fd !important;
        background-color: #1e293b !important;
        border-color: #60a5fa !important;
      }
    }
    
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      margin-bottom: 20px;
    }
    
    .greeting {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 6px;
      color: #111827;
    }
    
    @media (prefers-color-scheme: dark) {
      .greeting {
        color: #f1f5f9;
      }
    }
    
    .subtitle {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 20px;
    }
    
    .text-muted {
      color: #64748b;
    }
    
    .content {
      font-size: 15px;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    
    .content p {
      margin-bottom: 14px;
    }
    
    .content ul {
      margin: 12px 0 12px 18px;
    }
    
    .content li {
      margin-bottom: 6px;
    }
    
    .highlight {
      font-weight: 600;
      color: #2563eb;
    }
    
    @media (prefers-color-scheme: dark) {
      .highlight {
        color: #60a5fa;
      }
    }
    
    .links {
      display: flex;
      gap: 12px;
      margin: 20px 0;
      flex-wrap: wrap;
      justify-content: flex-start;
    }
    
    .link {
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
      padding: 8px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      white-space: nowrap;
    }
    
    .link:hover {
      background-color: #f8fafc;
      border-color: #2563eb;
      transform: translateY(-1px);
    }
    
    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 20px 0;
    }
    
    .tech-tag {
      background-color: #f1f5f9;
      color: #475569;
      padding: 4px 10px;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 500;
    }
    
    @media (prefers-color-scheme: dark) {
      .tech-tag {
        background-color: #334155;
        color: #cbd5e1;
      }
    }
    
    .signature {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 14px;
    }
    
    @media (prefers-color-scheme: dark) {
      .signature {
        border-color: #334155;
      }
    }
    
    .signature-name {
      font-weight: 600;
      margin-bottom: 2px;
    }
    
    /* Mobile responsiveness - FIXED */
    @media (max-width: 600px) {
      body {
        padding: 8px;
      }
      .container {
        padding: 16px;
        margin: 0;
        max-width: 100%;
        border-radius: 8px;
      }
      .greeting {
        font-size: 18px;
      }
      .content {
        font-size: 14px;
      }
      .links {
        flex-direction: column;
        gap: 8px;
      }
      .link {
        justify-content: center;
        padding: 12px 16px;
      }
      .tech-stack {
        justify-content: center;
      }
    }
    
    @media (max-width: 400px) {
      .container {
        padding: 12px;
        border-radius: 6px;
      }
      .content {
        font-size: 13px;
      }
      .tech-tag {
        font-size: 12px;
        padding: 3px 8px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="greeting">Hi ${name || 'Hiring Team'} 👋</div>
      <div class="subtitle text-muted">Hope you're having a great day!</div>
    </div>
    
    <div class="content">
      <p>I wanted to reach out about the <span class="highlight">${area || 'Full Stack Developer'}</span> role at <span class="highlight">${company || 'your company'}</span>. I've been following your work and really admire what you're building.</p>
      
      <p>In my recent projects, I've:</p>
      <ul>
        <li>Streamlined an e-commerce pharma B2C backend system</li>
        <li>Built a realtime FIR data dashboard for Delhi Police used during real incidents</li>
        <li>Modernized Central government systems to make them more searchable and efficient</li>
      </ul>
      
      <p>I genuinely enjoy solving real problems and building tools that make a meaningful impact — that's what draws me to your team.</p>
      
      <p>Would love to connect if this feels like a potential match. Thanks for your time!</p>
    </div>
    
    <div class="links">
      <a href="https://drive.google.com/drive/u/0/folders/1PmsRBzyB2bMdQzVFntOcBb5Za7WrA2w6" class="link">
        📄 Resume
      </a>
      <a href="https://www.linkedin.com/in/danish-abdullah-8295b137b/" class="link">
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
      <div class="text-muted">Full Stack Developer</div>
      <div class="text-muted">
        <a href="mailto:danishabdullah276@gmail.com" class="link" style="padding: 0; border: none;">danishabdullah276@gmail.com</a>
      </div>
    </div>
  </div>
</body>
</html>
`;
