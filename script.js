// Main application functionality
document.addEventListener('DOMContentLoaded', () => {
    const skillsCheckboxes = document.getElementById('skills-checkboxes');
    const customizeButton = document.getElementById('customize-btn');
    const resultContainer = document.getElementById('result-container');
    const resultOutput = document.getElementById('result-output');
    const loadingIndicator = document.getElementById('loading');
    const masterResumeDisplay = document.getElementById('master-resume-display');

    let masterResumeData = null;

    // Fetch master-resume.json dynamically
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
        })
        .catch(error => {
            console.error('Error loading master-resume.json:', error);
            skillsCheckboxes.innerHTML = '<p>Error loading skills. Please try again later.</p>';
        });

    /**
     * Display master resume preview and skills checkboxes
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

        const fragment = document.createDocumentFragment();
        skills.forEach((skill, index) => {
            const label = document.createElement('label');
            label.setAttribute('for', `skill-${index}`);
            label.innerHTML = `
                <input type="checkbox" id="skill-${index}" name="skill" value="${skill}">
                ${skill}
            `;
            fragment.appendChild(label);
            fragment.appendChild(document.createElement('br'));
        });
        skillsCheckboxes.appendChild(fragment);
    }

    /**
     * Customize the resume based on selected skills
     */
    customizeButton.addEventListener('click', () => {
        if (!masterResumeData) {
            alert('Master resume data is not loaded yet.');
            return;
        }

        // Get selected skills
        const selectedSkills = Array.from(document.querySelectorAll('input[name="skill"]:checked')).map(input => input.value);

        if (selectedSkills.length === 0) {
            alert('Please select at least one skill.');
            return;
        }

        // Show loading indicator
        loadingIndicator.style.display = 'block';

        // Generate customized resume
        const customizedResume = generateCustomizedResume(masterResumeData, selectedSkills);

        // Display result
        resultOutput.innerHTML = customizedResume;
        resultContainer.style.display = 'block';

        // Hide loading indicator
        loadingIndicator.style.display = 'none';

        // Scroll to results
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    });

    /**
     * Generate customized resume based on selected skills
     */
    function generateCustomizedResume(masterResume, selectedSkills) {
        const customResume = JSON.parse(JSON.stringify(masterResume));

        // Filter skills
        customResume.skills = customResume.skills.filter(skill => selectedSkills.includes(skill));

        // Convert the customized resume object to HTML
        return resumeToHTML(customResume);
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

        html += `</div>`;
        return html;
    }
});