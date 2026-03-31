// server-monitor.js

(function() {
    // --- 1. State Variables ---
    window.CurrentScriptVersions = window.CurrentScriptVersions || {};
    window.CurrentScriptVersions['timeCheck'] = '1.0.0';

    let warningDismissed = false;

    // --- 2. Create the UI Elements ---

    var iconWrench = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="w-5 h-5"><path d="M78.6 5C69.1-2.4 55.6-1.5 47 7L7 47c-8.5 8.5-9.4 22-2.1 31.6l80 106.7c-5.3 9.7-8.3 20.6-8.3 32.2c0 39.8 32.2 72 72 72c.6 0 1.2 0 1.8-.1l99.8 99.8c-2.4 5.3-3.8 11.2-3.8 17.4c0 23.9 19.4 43.3 43.3 43.3c11.2 0 21.4-4.3 29-11.4l102.7 102.7c8.5 8.5 22.3 8.5 30.8 0l40-40c8.5-8.5 8.5-22.3 0-30.8L389.5 367.7c7.1-7.6 11.4-17.8 11.4-29c0-23.9-19.4-43.3-43.3-43.3c-6.2 0-12.1 1.4-17.4 3.8l-99.8-99.8c.1-.6 .1-1.2 .1-1.8c0-39.8-32.2-72-72-72c-11.6 0-22.5 3-32.2 8.3L78.6 5zM352 352a16 16 0 1 1 32 0 16 16 0 1 1 -32 0zM144.1 207.9c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z"/></svg>`;
    var iconShield = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="w-5 h-5"><path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z"/></svg>`;
    var iconClose = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" class="w-6 h-6"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`;

    // --- Warning Popup (Toast) ---
    var warningPopup = document.createElement('div');
    warningPopup.id = 'studybase-warning-toast';
    // Widened to max-w-2xl for better text flow
    warningPopup.className = "fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white border border-amber-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-6 z-[2147483646] flex gap-5 items-start font-sans transition-all duration-500";
    warningPopup.style.transform = "translate(-50%, 150%)"; 
    warningPopup.style.opacity = "0";
    warningPopup.innerHTML = `
        <div class="flex-shrink-0 w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-100 shadow-sm animate-pulse">
            ${iconWrench}
        </div>
        <div class="flex-grow pt-1">
            <h3 class="text-slate-900 font-extrabold text-base mb-2 font-sans tracking-tight">Scheduled Daily Maintenance Imminent</h3>
            <p class="text-slate-600 text-sm font-body leading-relaxed mb-2">
                To protect infrastructure stability and proactively reduce overnight server load, StudyBase will initiate its standard automated shutdown at <strong>11:02 PM</strong>. 
            </p>
            <p class="text-slate-600 text-sm font-body leading-relaxed">
                This is a routine procedure to deploy updates and ensure peak performance for tomorrow. Services will automatically restore at <strong>4:00 AM</strong>. <span class="font-semibold text-amber-700">Please save your current work.</span>
            </p>
        </div>
        <button id="sb-dismiss-warning" class="text-slate-400 hover:text-slate-700 transition-colors pt-1 cursor-pointer bg-transparent border-none outline-none">
            ${iconClose}
        </button>
    `;
    document.body.appendChild(warningPopup);

    document.getElementById('sb-dismiss-warning').addEventListener('click', () => {
        warningDismissed = true;
        warningPopup.style.transform = "translate(-50%, 150%)";
        warningPopup.style.opacity = "0";
    });

    // --- Full Screen Shutdown Popup ---
    var shutdownPopup = document.createElement('div');
    shutdownPopup.id = 'studybase-shutdown-overlay';
    shutdownPopup.className = "fixed inset-0 z-[2147483647] bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-6 transition-all duration-700";
    shutdownPopup.style.opacity = "0";
    shutdownPopup.style.visibility = "hidden";
    shutdownPopup.innerHTML = `
        <div class="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl border border-slate-100 max-w-3xl w-full text-center font-sans">
            
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 mb-6 text-slate-700 text-xs font-bold uppercase tracking-widest shadow-sm">
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Routine Automated Maintenance
            </div>
            
            <h1 class="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-6 text-slate-900">
                StudyBase is currently<br>
                <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">offline for servicing</span>
            </h1>
            
            <div class="text-slate-600 mb-8 font-body leading-relaxed text-base max-w-2xl mx-auto space-y-4">
                <p>
                    As part of our commitment to providing a fast, secure, and reliable platform, StudyBase undergoes scheduled daily maintenance between <strong>11:02 PM and 4:00 AM</strong>.
                </p>
                <p>
                    During this window, our core servers are safely taken offline. This proactive measure significantly reduces overnight infrastructure load, allows us to process internal database health checks, and guarantees that essential system updates are deployed securely.
                </p>
            </div>
            
            <div class="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-left flex gap-5 items-start shadow-sm mx-auto max-w-2xl">
                <div class="flex-shrink-0 text-blue-600 mt-1 bg-white p-2 rounded-full shadow-sm">
                    ${iconShield}
                </div>
                <div>
                    <h4 class="font-extrabold text-slate-900 text-base mb-1 font-sans">Action Required: Keep this tab open</h4>
                    <p class="text-slate-600 text-sm font-body leading-relaxed">
                        Your active session is safely preserved. There is no need to log out or close your browser. At exactly <strong>4:00 AM</strong>, this system notice will automatically dismiss, and full access will be restored so you can continue seamlessly where you left off.
                    </p>
                </div>
            </div>
            
        </div>
    `;
    document.body.appendChild(shutdownPopup);

    // --- 3. Logic to Check the Time ---
    function checkServerTime() {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();


        var minutesPastMidnight = (hours * 60) + minutes;
        
        // Boundaries
        var time11_00PM = (23 * 60);       // 1380
        var time11_02PM = (23 * 60) + 2;   // 1382
        var time4_00AM = (4 * 60);         // 240

        // Warning phase (11:00 PM to 11:01:59 PM)
        if (minutesPastMidnight >= time11_00PM && minutesPastMidnight < time11_02PM) {
            if (!warningDismissed) {
                warningPopup.style.transform = "translate(-50%, 0)";
                warningPopup.style.opacity = "1";
            }
            shutdownPopup.style.opacity = "0";
            shutdownPopup.style.visibility = "hidden";
            document.body.style.overflow = ''; 
        } 
        // Shutdown phase (11:02 PM to 3:59:59 AM)
        else if (minutesPastMidnight >= time11_02PM || minutesPastMidnight < time4_00AM) {
            warningPopup.style.transform = "translate(-50%, 150%)";
            warningPopup.style.opacity = "0";
            warningDismissed = false; 
            
            shutdownPopup.style.visibility = "visible";
            shutdownPopup.style.opacity = "1";
            document.body.style.overflow = 'hidden';
        } 
        // Normal operation (4:00 AM to 10:59:59 PM)
        else {
            warningPopup.style.transform = "translate(-50%, 150%)";
            warningPopup.style.opacity = "0";
            warningDismissed = false;
            
            shutdownPopup.style.opacity = "0";
            shutdownPopup.style.visibility = "hidden";
            document.body.style.overflow = ''; 
        }
    }

    // --- 4. Run the Check ---
    checkServerTime();
    setInterval(checkServerTime, 5000); 

})();