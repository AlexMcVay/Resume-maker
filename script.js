// Main application functionality
document.addEventListener('DOMContentLoaded', () => {
    const skillsCheckboxes = document.getElementById('skills-checkboxes');
    const customizeButton = document.getElementById('customize-btn');
    const resetButton = document.getElementById('reset-btn');
    const resultContainer = document.getElementById('result-container');
    const resultOutput = document.getElementById('result-output');
    const loadingIndicator = document.getElementById('loading');
    const masterResumeDisplay = document.getElementById('master-resume-display');
    const keywordsDisplay = document.getElementById('keywords-display');
    const jobDescTextarea = document.getElementById('job-desc');
    const copyButton = document.getElementById('copy-btn');
    const downloadButton = document.getElementById('download-btn');

    let masterResumeData = null;

    // Use the master resume data from the template as a fallback
    // This ensures we have data even if fetch fails
    masterResumeData = masterResumeTemplate;
    displayMasterResumePreview(masterResumeData);
    displaySkillsCheckboxes(masterResumeData.skills);

    // Try to fetch master-resume.json
    fetch('master-resume.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load master-resume.json');
            }
            return response.json();
        })
        .then(data => {
            masterResumeData = data;
            displayMasterResumePreview(masterResumeData);
            displaySkillsCheckboxes(data.skills);
            console.log('Successfully loaded master-resume.json');
        })
        .catch(error => {
            console.error('Error loading master-resume.json:', error);
            // We're already using the template data as fallback
        });

    /**
     * Display master resume preview
     */
    function displayMasterResumePreview(resumeData) {
        // Display master resume sections
        const sections = Object.keys(resumeData);
        let previewHTML = '<div class="resume-preview">';
        previewHTML += '<h3>Master Resume Sections</h3><ul>';
        sections.forEach(section => {
            previewHTML += `<li><strong>${section}</strong> ${
                Array.isArray(resumeData[section]) ? `<span class="count">(${resumeData[section].length} items)</span>` : ''
            }</li>`;
        });
        previewHTML += '</ul></div>';
        masterResumeDisplay.innerHTML = previewHTML;
    }

    /**
     * Display checkboxes for each skill
     */
    function displaySkillsCheckboxes(skills) {
        if (!skills || skills.length === 0) {
            skillsCheckboxes.innerHTML = '<p>No skills available to display.</p>';
            return;
        }

        skillsCheckboxes.innerHTML = ''; // Clear existing content
        const fragment = document.createDocumentFragment();
        
        // Create a search input to filter skills
        const searchDiv = document.createElement('div');
        searchDiv.className = 'skills-search';
        searchDiv.innerHTML = `
            <input type="text" id="skills-search" placeholder="Search skills...">
            <div class="skills-actions">
                <button id="select-all-skills" class="secondary">Select All</button>
                <button id="deselect-all-skills" class="secondary">Deselect All</button>
            </div>
        `;
        fragment.appendChild(searchDiv);
        
        // Create a container for the skills checkboxes
        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'skills-container';
        
        skills.forEach((skill, index) => {
            const label = document.createElement('label');
            label.setAttribute('for', `skill-${index}`);
            label.innerHTML = `
                <input type="checkbox" id="skill-${index}" name="skill" value="${skill}">
                ${skill}
            `;
            skillsContainer.appendChild(label);
        });
        
        fragment.appendChild(skillsContainer);
        skillsCheckboxes.appendChild(fragment);
        
        // Add search functionality
        const searchInput = document.getElementById('skills-search');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const skillLabels = skillsContainer.querySelectorAll('label');
            
            skillLabels.forEach(label => {
                const skillText = label.textContent.trim().toLowerCase();
                if (skillText.includes(searchTerm)) {
                    label.style.display = '';
                } else {
                    label.style.display = 'none';
                }
            });
        });
        
        // Add select/deselect all functionality
        document.getElementById('select-all-skills').addEventListener('click', () => {
            const visibleCheckboxes = Array.from(skillsContainer.querySelectorAll('label:not([style*="display: none"]) input[type="checkbox"]'));
            visibleCheckboxes.forEach(checkbox => checkbox.checked = true);
        });
        
        document.getElementById('deselect-all-skills').addEventListener('click', () => {
            const visibleCheckboxes = Array.from(skillsContainer.querySelectorAll('label:not([style*="display: none"]) input[type="checkbox"]'));
            visibleCheckboxes.forEach(checkbox => checkbox.checked = false);
        });
    }

    /**
     * Extract keywords from job description
     */
    function extractKeywords(jobDesc, allSkills) {
        if (!jobDesc || !allSkills) return [];
        
        const jobDescLower = jobDesc.toLowerCase();
        return allSkills.filter(skill => 
            jobDescLower.includes(skill.toLowerCase())
        );
    }

    /**
     * Display found keywords
     */
    function displayKeywords(keywords) {
        if (!keywords || keywords.length === 0) {
            keywordsDisplay.innerHTML = '<p>No matching keywords found in job description.</p>';
            return;
        }
        
        let html = '<div class="keywords-list">';
        keywords.forEach(keyword => {
            html += `<span class="keyword-chip">${keyword}</span>`;
        });
        html += '</div>';
        
        keywordsDisplay.innerHTML = html;
        document.getElementById('keywords-section').style.display = 'block';
    }

    /**
     * Customize the resume based on job description and selected skills
     */
    customizeButton.addEventListener('click', () => {
        if (!masterResumeData) {
            alert('Master resume data is not loaded yet.');
            return;
        }

        // Get job description
        const jobDesc = jobDescTextarea.value.trim();
        
        // Get all skills checkboxes
        const skillCheckboxes = document.querySelectorAll('input[name="skill"]');
        
        // If job description is provided, extract and highlight keywords
        if (jobDesc) {
            const keywords = extractKeywords(jobDesc, masterResumeData.skills);
            displayKeywords(keywords);
            
            // Automatically check matching skills
            skillCheckboxes.forEach(checkbox => {
                if (keywords.includes(checkbox.value)) {
                    checkbox.checked = true;
                }
            });
        }

        // Get selected skills
        const selectedSkills = Array.from(document.querySelectorAll('input[name="skill"]:checked')).map(input => input.value);

        if (selectedSkills.length === 0) {
            alert('Please select at least one skill or enter a job description to auto-select skills.');
            return;
        }

        // Show loading indicator
        loadingIndicator.style.display = 'block';

        // Generate customized resume
        setTimeout(() => {
            // Wrap in setTimeout to ensure UI updates
            const customizedResume = generateCustomizedResume(masterResumeData, selectedSkills, jobDesc);
            
            // Display result
            resultOutput.innerHTML = customizedResume;
            resultContainer.style.display = 'block';
            
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
            
            // Scroll to results
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        }, 500);
    });

    /**
     * Reset the form
     */
    resetButton.addEventListener('click', () => {
        // Clear job description
        jobDescTextarea.value = '';
        
        // Uncheck all skills
        document.querySelectorAll('input[name="skill"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear keywords
        keywordsDisplay.innerHTML = '';
        document.getElementById('keywords-section').style.display = 'none';
        
        // Hide results
        resultContainer.style.display = 'none';
    });

    /**
     * Generate customized resume based on selected skills and job description
     */
    function generateCustomizedResume(masterResume, selectedSkills, jobDesc) {
        const customResume = JSON.parse(JSON.stringify(masterResume));

        // Filter skills to include only selected ones
        customResume.skills = customResume.skills.filter(skill => selectedSkills.includes(skill));
        
        // Filter experience
        if (customResume.experience) {
            customResume.experience = customResume.experience.map(job => {
                // Keep the job, but filter accomplishments
                const filteredJob = {...job};
                
                if (filteredJob.accomplishments) {
                    filteredJob.accomplishments = filteredJob.accomplishments.filter(acc => {
                        if (!acc.tags) return true;
                        
                        // Keep accomplishments that match selected skills
                        return acc.tags.some(tag => selectedSkills.includes(tag));
                    });
                }
                
                return filteredJob;
            }).filter(job => job.accomplishments && job.accomplishments.length > 0);
        }
        
        // Filter projects to match selected skills
        if (customResume.projects) {
            customResume.projects = customResume.projects.filter(project => {
                if (!project.technologies && !project.tags) return true;
                
                // Check if any technology matches selected skills
                const techMatch = project.technologies ? 
                    project.technologies.some(tech => selectedSkills.includes(tech)) : false;
                
                // Check if any tag matches selected skills
                const tagMatch = project.tags ?
                    project.tags.some(tag => selectedSkills.includes(tag)) : false;
                
                return techMatch || tagMatch;
            });
        }

        // Convert the customized resume object to HTML
        return resumeToHTML(customResume, jobDesc, selectedSkills);
    }

    /**
     * Convert resume object to HTML
     */
    function resumeToHTML(resumeData, jobDesc, selectedSkills) {
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
                    <h2>Summary</h2>
                    <p>${highlightKeywords(resumeData.summary, selectedSkills)}</p>
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
                            <p><span class="company">${job.company}</span>, ${job.location}</p>
                            <p class="date">${job.startDate} - ${job.endDate}</p>
                        </div>
                `;
                
                if (job.accomplishments && job.accomplishments.length > 0) {
                    html += '<ul>';
                    job.accomplishments.forEach(acc => {
                        const text = typeof acc === 'string' ? acc : acc.text;
                        html += `<li>${highlightKeywords(text, selectedSkills)}</li>`;
                    });
                    html += '</ul>';
                }
                
                if (job.technologies && job.technologies.length > 0) {
                    html += `<p><strong>Technologies:</strong> ${job.technologies.join(', ')}</p>`;
                }
                
                html += '</div>';
            });
            
            html += '</section>';
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
                        <p>${edu.institution}, ${edu.location}</p>
                        <p>${edu.startDate ? edu.startDate + ' - ' : ''}${edu.graduationDate}</p>
                        ${edu.inProgress ? '<p><em>In Progress</em></p>' : ''}
                `;
                
                if (edu.courses && edu.courses.length > 0) {
                    html += `<p><strong>Relevant Courses:</strong> ${edu.courses.join(', ')}</p>`;
                }
                
                html += '</div>';
            });
            
            html += '</section>';
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
                        <p>${highlightKeywords(project.description, selectedSkills)}</p>
                `;
                
                if (project.technologies && project.technologies.length > 0) {
                    html += `<p><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>`;
                }
                
                html += '</div>';
            });
            
            html += '</section>';
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
                        <strong>${cert.name}</strong> - ${cert.issuer} (${cert.date})
                        ${cert.description ? `<p>${cert.description}</p>` : ''}
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
     * Highlight keywords in text
     */
    function highlightKeywords(text, keywords) {
        if (!text || !keywords || keywords.length === 0) return text;
        
        let highlightedText = text;
        keywords.forEach(keyword => {
            if (!keyword) return;
            
            const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
            highlightedText = highlightedText.replace(regex, match => `<span class="highlight">${match}</span>`);
        });
        
        return highlightedText;
    }

    // Add clipboard copy functionality
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const content = resultOutput.innerText;
            navigator.clipboard.writeText(content)
                .then(() => {
                    alert('Resume copied to clipboard!');
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                    alert('Failed to copy. Please try selecting and copying manually.');
                });
        });
    }

    // Add download functionality
    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            const content = resultOutput.innerHTML;
            const blob = new Blob([`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Customized Resume</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2em; }
                        .resume-header { text-align: center; margin-bottom: 1.5rem; }
                        .contact-info { font-size: 0.9em; }
                        .resume section { margin-bottom: 1.5rem; }
                        .job, .education-item, .project { margin-bottom: 1rem; }
                        .company, .date { font-style: italic; }
                        .highlight { background-color: #ffeb3b; font-weight: bold; }
                        .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
                        .skills-list li { background-color: #f1f1f1; padding: 3px 10px; border-radius: 15px; font-size: 0.9em; }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
                </html>
            `], {type: 'text/html'});
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'customized-resume.html';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    }
});