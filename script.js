// Main application functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with master resume data
    // In a real implementation, this would be loaded from your GitHub repo
    let masterResumeData = masterResumeTemplate;
    
    // DOM elements
    const jobDescTextarea = document.getElementById('job-desc');
    const customizeButton = document.getElementById('customize-btn');
    const resultContainer = document.getElementById('result-container');
    const resultOutput = document.getElementById('result-output');
    const copyButton = document.getElementById('copy-btn');
    const downloadButton = document.getElementById('download-btn');
    const loadingIndicator = document.getElementById('loading');
    const resetButton = document.getElementById('reset-btn');
    const keywordsDisplay = document.getElementById('keywords-display');
    const skillsCheckboxes = document.getElementById('skills-checkboxes');
    const customizeOptions = document.getElementById('customize-options');
    const masterResumeDisplay = document.getElementById('master-resume-display');
    
    // Display master resume sections preview
    displayMasterResumePreview(masterResumeData);
    
    // Event listeners
    customizeButton.addEventListener('click', customizeResume);
    copyButton.addEventListener('click', copyToClipboard);
    downloadButton.addEventListener('click', downloadResume);
    resetButton.addEventListener('click', resetForm);
    
    /**
     * Display master resume preview
     */
    function displayMasterResumePreview(resumeData) {
        // Create a preview of the master resume structure
        const sections = Object.keys(resumeData);
        
        let previewHTML = '<div class="resume-preview">';
        previewHTML += '<h3>Master Resume Sections</h3>';
        previewHTML += '<ul>';
        
        sections.forEach(section => {
            previewHTML += `<li>
                <strong>${section}</strong>
                ${Array.isArray(resumeData[section]) ? 
                    `<span class="count">(${resumeData[section].length} items)</span>` : ''}
            </li>`;
        });
        
        previewHTML += '</ul></div>';
        masterResumeDisplay.innerHTML = previewHTML;
        
        // Populate skills checkboxes
        if (resumeData.skills && resumeData.skills.length > 0) {
            let skillsHTML = '<div class="skills-options">';
            skillsHTML += '<p>Select skills to prioritize:</p>';
            
            resumeData.skills.forEach((skill, index) => {
                skillsHTML += `
                    <label for="skill-${index}">
                        <input type="checkbox" id="skill-${index}" name="skill" value="${skill}">
                        ${skill}
                    </label>
                `;
            });
            
            skillsHTML += '</div>';
            skillsCheckboxes.innerHTML = skillsHTML;
        }
    }
    
    /**
     * Main function to customize the resume based on job description
     */
    function customizeResume() {
        // Validate inputs
        if (!jobDescTextarea.value.trim()) {
            alert('Please enter a job description');
            return;
        }
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        
        // Extract keywords from job description
        const jobDescription = jobDescTextarea.value;
        const keywords = extractKeywords(jobDescription);
        
        // Display found keywords
        displayKeywords(keywords);
        
        // Generate customized resume
        const customizedResume = generateCustomizedResume(masterResumeData, keywords);
        
        // Display result
        resultOutput.innerHTML = customizedResume;
        resultContainer.style.display = 'block';
        
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        
        // Scroll to results
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Extract keywords from the job description
     */
    function extractKeywords(jobDescription) {
        // Common skills and keywords to look for
        const commonSkills = [
            'javascript', 'react', 'vue', 'angular', 'node', 'python', 'java', 'c++', 'c#',
            'php', 'ruby', 'sql', 'nosql', 'mongodb', 'mysql', 'postgresql', 'aws', 'azure',
            'docker', 'kubernetes', 'devops', 'ci/cd', 'agile', 'scrum', 'project management',
            'leadership', 'communication', 'problem solving', 'analytical', 'data analysis',
            'machine learning', 'ai', 'cloud computing', 'frontend', 'backend', 'fullstack',
            'mobile', 'ios', 'android', 'react native', 'flutter', 'ui/ux', 'design',
            'product management', 'marketing', 'sales', 'customer service', 'finance',
            'accounting', 'hr', 'human resources', 'recruiting', 'operations', 'business analysis'
        ];
        
        // Process the job description
        const text = jobDescription.toLowerCase();
        const foundKeywords = [];
        
        // Find matches for common skills
        commonSkills.forEach(skill => {
            if (text.includes(skill.toLowerCase())) {
                foundKeywords.push(skill);
            }
        });
        
        // Look for years of experience requirements
        const expMatches = text.match(/(\d+)[\+]?\s+years?(?:\s+of)?\s+experience/g);
        if (expMatches) {
            foundKeywords.push(...expMatches);
        }
        
        // Look for education requirements
        const educationMatches = text.match(/bachelor'?s|master'?s|phd|doctorate|degree|certification/gi);
        if (educationMatches) {
            foundKeywords.push(...educationMatches.map(m => m.toLowerCase()));
        }
        
        // Look for job titles
        const titleMatches = text.match(/(?:senior|junior|lead|principal|staff)?\s*(?:software|systems|data|frontend|backend|fullstack|web|mobile|cloud|devops|site reliability|security|network|database|ai|ml)\s*(?:engineer|developer|architect|analyst|scientist|administrator|specialist|manager|director)/gi);
        if (titleMatches) {
            foundKeywords.push(...titleMatches.map(m => m.toLowerCase()));
        }
        
        // Remove duplicates
        return [...new Set(foundKeywords)];
    }
    
    /**
     * Display extracted keywords
     */
    function displayKeywords(keywords) {
        keywordsDisplay.innerHTML = '';
        
        if (keywords.length === 0) {
            keywordsDisplay.innerHTML = '<p>No specific keywords found. Generating a general resume.</p>';
            return;
        }
        
        const keywordsList = document.createElement('div');
        keywordsList.className = 'keywords-list';
        
        keywords.forEach(keyword => {
            const chip = document.createElement('span');
            chip.className = 'keyword-chip';
            chip.textContent = keyword;
            keywordsList.appendChild(chip);
        });
        
        keywordsDisplay.appendChild(keywordsList);
    }
    
    /**
     * Generate customized resume based on keywords
     */
    function generateCustomizedResume(masterResume, keywords) {
        // Create a deep copy of the master resume to work with
        const customResume = JSON.parse(JSON.stringify(masterResume));
        
        // Process each section of the resume
        if (customResume.skills) {
            // Prioritize skills that match keywords
            customResume.skills = prioritizeItems(customResume.skills, keywords);
        }
        
        if (customResume.experience) {
            // For each experience item, emphasize relevant accomplishments
            customResume.experience = customResume.experience.map(job => {
                if (job.accomplishments) {
                    job.accomplishments = prioritizeItems(job.accomplishments, keywords);
                }
                // Calculate relevance score for this job
                job.relevanceScore = calculateRelevance(job, keywords);
                return job;
            });
            
            // Sort experiences by relevance score
            customResume.experience.sort((a, b) => b.relevanceScore - a.relevanceScore);
            
            // Remove relevance scores after sorting
            customResume.experience.forEach(job => delete job.relevanceScore);
        }
        
        if (customResume.projects) {
            // Prioritize projects that match keywords
            customResume.projects.forEach(project => {
                if (project.description) {
                    project.highlightedDescription = highlightKeywords(project.description, keywords);
                }
                // Calculate relevance score
                project.relevanceScore = calculateRelevance(project, keywords);
            });
            
            // Sort projects by relevance
            customResume.projects.sort((a, b) => b.relevanceScore - a.relevanceScore);
            
            // Keep only top projects
            if (customResume.projects.length > 3) {
                customResume.projects = customResume.projects.slice(0, 3);
            }
            
            // Remove relevance scores
            customResume.projects.forEach(project => delete project.relevanceScore);
        }
        
        // Convert the customized resume object to HTML
        return resumeToHTML(customResume);
    }
    
    /**
     * Prioritize items based on keyword relevance
     */
    function prioritizeItems(items, keywords) {
        return items.sort((a, b) => {
            const aRelevance = keywords.filter(keyword => 
                (typeof a === 'string' ? a : JSON.stringify(a))
                .toLowerCase()
                .includes(keyword.toLowerCase())
            ).length;
            
            const bRelevance = keywords.filter(keyword => 
                (typeof b === 'string' ? b : JSON.stringify(b))
                .toLowerCase()
                .includes(keyword.toLowerCase())
            ).length;
            
            return bRelevance - aRelevance;
        });
    }
    
    /**
     * Calculate relevance score for a job or project
     */
    function calculateRelevance(item, keywords) {
        const itemText = JSON.stringify(item).toLowerCase();
        let score = 0;
        
        keywords.forEach(keyword => {
            const keywordLower = keyword.toLowerCase();
            // Count occurrences
            const matches = (itemText.match(new RegExp(keywordLower, 'g')) || []).length;
            score += matches;
            
            // Bonus for keyword in title/position
            if (item.title && item.title.toLowerCase().includes(keywordLower)) {
                score += 3;
            }
            
            // Bonus for keyword in technologies/tools
            if (item.technologies && 
                item.technologies.some(tech => tech.toLowerCase().includes(keywordLower))) {
                score += 2;
            }
        });
        
        return score;
    }
    
    /**
     * Highlight keywords in text
     */
    function highlightKeywords(text, keywords) {
        let highlightedText = text;
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            highlightedText = highlightedText.replace(regex, match => `<span class="highlight">${match}</span>`);
        });
        return highlightedText;
    }
    
    /**
     * Convert resume object to HTML
     */
    function resumeToHTML(resumeData) {
        let html = `
            <div class="resume">
                <header class="resume-header">
                    <h1>${resumeData.personalInfo?.name || 'Your Name'}</h1>
                    <div class="contact-info">
                        <p>${resumeData.personalInfo?.email || 'email@example.com'} | ${resumeData.personalInfo?.phone || '(123) 456-7890'}</p>
                        <p>${resumeData.personalInfo?.location || 'City, State'}</p>
                        ${resumeData.personalInfo?.linkedin ? `<p><a href="${resumeData.personalInfo.linkedin}" target="_blank">LinkedIn</a></p>` : ''}
                        ${resumeData.personalInfo?.github ? `<p><a href="${resumeData.personalInfo.github}" target="_blank">GitHub</a></p>` : ''}
                    </div>
                </header>
        `;
        
        // Summary section
        if (resumeData.summary) {
            html += `
                <section class="resume-summary">
                    <h2>Professional Summary</h2>
                    <p>${resumeData.summary}</p>
                </section>
            `;
        }
        
        // Skills section
        if (resumeData.skills && resumeData.skills.length > 0) {
            html += `
                <section class="resume-skills">
                    <h2>Skills</h2>
                    <ul class="skills-list">
            `;
            
            resumeData.skills.forEach(skill => {
                html += `<li>${skill}</li>`;
            });
            
            html += `
                    </ul>
                </section>
            `;
        }
        
        // Experience section
        if (resumeData.experience && resumeData.experience.length > 0) {
            html += `
                <section class="resume-experience">
                    <h2>Experience</h2>
            `;
            
            resumeData.experience.forEach(job => {
                html += `
                    <div class="job">
                        <div class="job-header">
                            <h3>${job.title}</h3>
                            <p class="company">${job.company}</p>
                            <p class="date">${job.startDate} - ${job.endDate || 'Present'}</p>
                        </div>
                `;
                
                if (job.accomplishments && job.accomplishments.length > 0) {
                    html += `<ul class="accomplishments">`;
                    job.accomplishments.forEach(item => {
                        html += `<li>${item}</li>`;
                    });
                    html += `</ul>`;
                }
                
                html += `</div>`;
            });
            
            html += `
                </section>
            `;
        }
        
        // Education section
        if (resumeData.education && resumeData.education.length > 0) {
            html += `
                <section class="resume-education">
                    <h2>Education</h2>
            `;
            
            resumeData.education.forEach(edu => {
                html += `
                    <div class="education-item">
                        <h3>${edu.degree}</h3>
                        <p>${edu.institution}</p>
                        <p>${edu.graduationDate}</p>
                        ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ''}
                    </div>
                `;
            });
            
            html += `
                </section>
            `;
        }
        
        // Projects section
        if (resumeData.projects && resumeData.projects.length > 0) {
            html += `
                <section class="resume-projects">
                    <h2>Projects</h2>
            `;
            
            resumeData.projects.forEach(project => {
                html += `
                    <div class="project">
                        <h3>${project.name}</h3>
                        ${project.url ? `<p><a href="${project.url}" target="_blank">${project.url}</a></p>` : ''}
                        <p>${project.highlightedDescription || project.description}</p>
                        
                        ${project.technologies && project.technologies.length > 0 ? 
                            `<p class="technologies">Technologies: ${project.technologies.join(', ')}</p>` : ''}
                    </div>
                `;
            });
            
            html += `
                </section>
            `;
        }
        
        // Certifications section
        if (resumeData.certifications && resumeData.certifications.length > 0) {
            html += `
                <section class="resume-certifications">
                    <h2>Certifications</h2>
                    <ul>
            `;
            
            resumeData.certifications.forEach(cert => {
                html += `
                    <li>
                        <strong>${cert.name}</strong> - ${cert.issuer}
                        ${cert.date ? ` (${cert.date})` : ''}
                    </li>
                `;
            });
            
            html += `
                    </ul>
                </section>
            `;
        }
        
        html += `</div>`;
        
        return html;
    }
    
    /**
     * Copy customized resume to clipboard
     */
    function copyToClipboard() {
        // Create a temporary textarea element to copy the resume text
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = resultOutput.innerText;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        
        // Show a success message
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 2000);
    }
    
    /**
     * Download resume as HTML file
     */
    function downloadResume() {
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Customized Resume</title>
                <!-- Include Pico CSS -->
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
                <style>
                    /* Additional custom styles */
                    body {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .resume-header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .contact-info {
                        font-size: 0.9em;
                    }
                    .highlight {
                        background-color: #ffffcc;
                        font-weight: bold;
                    }
                    .skills-list {
                        display: flex;
                        flex-wrap: wrap;
                        list-style-type: none;
                        padding: 0;
                        gap: 10px;
                    }
                    .skills-list li {
                        margin: 0;
                        padding: 2px 10px;
                        background-color: #f1f1f1;
                        border-radius: 15px;
                        font-size: 0.9em;
                    }
                    article {
                        margin-bottom: 20px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #eee;
                    }
                    /* Print-friendly styles */
                    @media print {
                        body {
                            font-size: 12pt;
                        }
                        h1 { font-size: 18pt; }
                        h2 { font-size: 14pt; }
                        h3 { font-size: 12pt; }
                    }
                </style>
            </head>
            <body>
                <main class="container">
                    ${resultOutput.innerHTML}
                </main>
            </body>
            </html>
        `;
        
        // Create a Blob with the HTML content
        const blob = new Blob([html], { type: 'text/html' });
        
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'customized-resume.html';
        
        // Trigger the download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    
    /**
     * Reset the form
     */
    function resetForm() {
        jobDescTextarea.value = '';
        keywordsDisplay.innerHTML = '';
        resultContainer.style.display = 'none';
    }
});