// Cookie Consent Banner for GDPR Compliance
(function() {
    'use strict';

    // Check if consent has already been given
    function hasConsent() {
        return localStorage.getItem('cookie-consent') === 'accepted';
    }

    // Save consent choice
    function saveConsent(accepted) {
        localStorage.setItem('cookie-consent', accepted ? 'accepted' : 'rejected');
        localStorage.setItem('cookie-consent-date', new Date().toISOString());
    }

    // Create and show cookie banner
    function createCookieBanner() {
        if (hasConsent()) return;

        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-text">
                    <h4>🍪 Cookies und Datenschutz</h4>
                    <p>Diese Website verwendet Cookies und externe Dienste (Google reCAPTCHA und Google Fonts) zur Verbesserung der Benutzerfreundlichkeit. Durch die weitere Nutzung der Website stimmen Sie der Verwendung zu. Weitere Informationen finden Sie in unserer <a href="privacy.html" target="_blank">Datenschutzerklärung</a>.</p>
                </div>
                <div class="cookie-buttons">
                    <button id="cookie-accept" class="cookie-btn accept">Alle akzeptieren</button>
                    <button id="cookie-reject" class="cookie-btn reject">Nur notwendige</button>
                    <button id="cookie-settings" class="cookie-btn settings">Einstellungen</button>
                </div>
            </div>
            <div id="cookie-settings-panel" class="cookie-settings-panel" style="display: none;">
                <h4>Cookie-Einstellungen</h4>
                <div class="cookie-category">
                    <label>
                        <input type="checkbox" checked disabled> 
                        <strong>Notwendige Cookies</strong><br>
                        <small>Diese Cookies sind für die Grundfunktionen der Website erforderlich.</small>
                    </label>
                </div>
                <div class="cookie-category">
                    <label>
                        <input type="checkbox" id="recaptcha-cookies"> 
                        <strong>Google reCAPTCHA</strong><br>
                        <small>Schutz vor Spam und automatisierten Anfragen im Kontaktformular.</small>
                    </label>
                </div>
                <div class="cookie-category">
                    <label>
                        <input type="checkbox" id="external-fonts"> 
                        <strong>Google Fonts</strong><br>
                        <small>Externe Schriftarten für optimale Darstellung der Website.</small>
                    </label>
                </div>
                <div class="settings-buttons">
                    <button id="save-settings" class="cookie-btn accept">Einstellungen speichern</button>
                    <button id="close-settings" class="cookie-btn reject">Schließen</button>
                </div>
            </div>
        `;

        // Styles are now in the main CSS file
        document.body.appendChild(banner);

        // Event listeners
        document.getElementById('cookie-accept').addEventListener('click', function() {
            saveConsent(true);
            enableAllCookies();
            banner.remove();
        });

        document.getElementById('cookie-reject').addEventListener('click', function() {
            saveConsent(false);
            disableNonEssentialCookies();
            banner.remove();
        });

        document.getElementById('cookie-settings').addEventListener('click', function() {
            const panel = document.getElementById('cookie-settings-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('save-settings').addEventListener('click', function() {
            const recaptchaEnabled = document.getElementById('recaptcha-cookies').checked;
            const fontsEnabled = document.getElementById('external-fonts').checked;
            
            saveConsent(true);
            saveSpecificSettings(recaptchaEnabled, fontsEnabled);
            
            if (recaptchaEnabled) {
                enableRecaptcha();
            } else {
                disableRecaptcha();
            }

            if (fontsEnabled) {
                enableGoogleFonts();
            } else {
                disableGoogleFonts();
            }
            
            banner.remove();
        });

        document.getElementById('close-settings').addEventListener('click', function() {
            document.getElementById('cookie-settings-panel').style.display = 'none';
        });
    }

    // Cookie management functions
    function enableAllCookies() {
        localStorage.setItem('recaptcha-enabled', 'true');
        localStorage.setItem('fonts-enabled', 'true');
        enableRecaptcha();
        enableGoogleFonts();
    }

    function disableNonEssentialCookies() {
        localStorage.setItem('recaptcha-enabled', 'false');
        localStorage.setItem('fonts-enabled', 'false');
        disableRecaptcha();
        disableGoogleFonts();
    }

    function saveSpecificSettings(recaptcha, fonts) {
        localStorage.setItem('recaptcha-enabled', recaptcha.toString());
        localStorage.setItem('fonts-enabled', fonts.toString());
    }

    function enableRecaptcha() {
        const recaptchaElement = document.querySelector('.g-recaptcha');
        if (recaptchaElement) {
            recaptchaElement.style.display = 'block';
        }
        console.log('reCAPTCHA enabled');
    }

    function disableRecaptcha() {
        const recaptchaElement = document.querySelector('.g-recaptcha');
        if (recaptchaElement) {
            recaptchaElement.style.display = 'none';
        }
        console.log('reCAPTCHA disabled');
    }

    function enableGoogleFonts() {
        // Remove any existing font disable styles
        const disableStyle = document.getElementById('disable-google-fonts');
        if (disableStyle) {
            disableStyle.remove();
        }
        console.log('Google Fonts enabled');
    }

    function disableGoogleFonts() {
        // Add CSS to block Google Fonts and use fallbacks
        if (!document.getElementById('disable-google-fonts')) {
            const style = document.createElement('style');
            style.id = 'disable-google-fonts';
            style.textContent = `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap') {
                    display: none !important;
                }
                body, * {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                }
            `;
            document.head.appendChild(style);
        }
        console.log('Google Fonts disabled');
    }

    // Check consent on page load
    function checkConsentOnLoad() {
        if (!hasConsent()) {
            // Show banner after page loads
            setTimeout(createCookieBanner, 1000);
        } else {
            // Apply saved settings
            const recaptchaEnabled = localStorage.getItem('recaptcha-enabled') === 'true';
            const fontsEnabled = localStorage.getItem('fonts-enabled') === 'true';
            
            if (!recaptchaEnabled) {
                disableRecaptcha();
            }
            
            if (!fontsEnabled) {
                disableGoogleFonts();
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkConsentOnLoad);
    } else {
        checkConsentOnLoad();
    }

})();