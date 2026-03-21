import './FootballField.css'

export default function FootballField() {
    return (
        <div id="pitch-export-area" className="pitch-container">
            <svg className="pitch-svg-background" xmlns="http://www.w3.org/2000/svg">
                <rect x="2%" y="2%" width="96%" height="96%" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" />
                <line x1="2%" y1="50%" x2="98%" y2="50%" stroke="var(--accent-cyan)" strokeWidth="2" />
                
                <circle cx="50%" cy="50%" r="15%" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" />
                <circle cx="50%" cy="50%" r="1%" fill="var(--accent-cyan)" />
                
                <rect x="25%" y="2%" width="50%" height="16%" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" />
                <rect x="38%" y="2%" width="24%" height="6%" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" />
                <path d="M 38 18 A 15 15 0 0 0 62 18" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" />

                <rect x="25%" y="82%" width="50%" height="16%" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" />
                <rect x="38%" y="92%" width="24%" height="6%" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" />
                <path d="M 38 82 A 15 15 0 0 1 62 82" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" />
            </svg>
    </div>
    )
}