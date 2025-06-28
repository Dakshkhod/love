document.addEventListener('DOMContentLoaded', function() {
    const loveForm = document.getElementById('loveForm');
    const resultDiv = document.getElementById('result');
    const calculateAgainBtn = document.getElementById('calculateAgain');
    
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
}); 