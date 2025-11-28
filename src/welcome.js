document.addEventListener("DOMContentLoaded", () => {
    const text = "> System Check: OK\n> Dopamine Shield: ACTIVE\n> Scroll Friction: ENABLED\n\nYour mission: Take back control of your brain.\nGo to Facebook or YouTube to test the system.";
    
    let i = 0;
    const speed = 40; 
    const targetElement = document.getElementById("typewriter");

    function typeWriter() {
        if (targetElement && i < text.length) {
            targetElement.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        } else if (targetElement) {
            targetElement.style.borderRight = "none";
            const btn = document.getElementById('enter-btn');
            if(btn) btn.style.opacity = '1'; 
        }
    }
    
    setTimeout(typeWriter, 500);

    const closeBtn = document.getElementById('enter-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.close(); 
        });
    }
});