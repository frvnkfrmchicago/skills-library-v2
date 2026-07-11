export class InputController {
    private onLeftCallback: (() => void) | null = null;
    private onRightCallback: (() => void) | null = null;
    private onJumpCallback: (() => void) | null = null;
    private onSlideCallback: (() => void) | null = null;
    private onPauseCallback: (() => void) | null = null;

    // Mobile Swipe variables
    private touchStartX = 0;
    private touchStartY = 0;
    private minSwipeDistance = 30; // Min pixels to register as swipe

    constructor() {
        this.initKeyboardListeners();
        this.initTouchListeners();
    }

    // Set callback registers
    public onLeft(cb: () => void) { this.onLeftCallback = cb; }
    public onRight(cb: () => void) { this.onRightCallback = cb; }
    public onJump(cb: () => void) { this.onJumpCallback = cb; }
    public onSlide(cb: () => void) { this.onSlideCallback = cb; }
    public onPause(cb: () => void) { this.onPauseCallback = cb; }

    private initKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            switch (key) {
                case 'arrowleft':
                case 'a':
                    if (this.onLeftCallback) this.onLeftCallback();
                    break;
                case 'arrowright':
                case 'd':
                    if (this.onRightCallback) this.onRightCallback();
                    break;
                case 'arrowup':
                case 'w':
                case ' ': // Space
                    e.preventDefault(); // Prevent page scroll
                    if (this.onJumpCallback) this.onJumpCallback();
                    break;
                case 'arrowdown':
                case 's':
                    e.preventDefault(); // Prevent page scroll
                    if (this.onSlideCallback) this.onSlideCallback();
                    break;
                case 'escape':
                case 'p':
                    if (this.onPauseCallback) this.onPauseCallback();
                    break;
            }
        });
    }

    private initTouchListeners() {
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            if (e.changedTouches.length > 0) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                
                const deltaX = touchEndX - this.touchStartX;
                const deltaY = touchEndY - this.touchStartY;
                
                const absDeltaX = Math.abs(deltaX);
                const absDeltaY = Math.abs(deltaY);
                
                // Determine if it was a significant swipe
                if (Math.max(absDeltaX, absDeltaY) > this.minSwipeDistance) {
                    if (absDeltaX > absDeltaY) {
                        // Horizontal Swipe
                        if (deltaX < 0) {
                            if (this.onLeftCallback) this.onLeftCallback();
                        } else {
                            if (this.onRightCallback) this.onRightCallback();
                        }
                    } else {
                        // Vertical Swipe
                        if (deltaY < 0) {
                            // Swiped up (Remember: touch Y goes down)
                            if (this.onJumpCallback) this.onJumpCallback();
                        } else {
                            // Swiped down
                            if (this.onSlideCallback) this.onSlideCallback();
                        }
                    }
                }
            }
        }, { passive: true });
    }
}
