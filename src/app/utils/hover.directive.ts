import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appHover]',
})

export class HoverDirective {

    @Input() hoverDefaultClass: string;
    @Input() hoverActiveClass: string;

    private isActive: Boolean = false;

    constructor(private el: ElementRef) {
        this.isActive = false;
        this.toggle();
    }

    @HostListener('mouseenter') onMouseEnter() {
        this.isActive = true;
        this.toggle();
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.isActive = false;
        this.toggle();
    }

    private toggle() {
        if (this.isActive) {
            this.el.nativeElement.classList.remove(this.hoverDefaultClass);
            this.el.nativeElement.classList.add(this.hoverActiveClass);
        } else {
            this.el.nativeElement.classList.remove(this.hoverActiveClass);
            this.el.nativeElement.classList.add(this.hoverDefaultClass);
        }
    }
}
