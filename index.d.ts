// Type definitions for pageswitch>=2.3.5
// Project: pageSwitch
// Definitions by: qiqiboy

declare type PageSwitchEaseString = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
declare type PageSwitchEaseFunc = (current: number, begin: number, changed: number, duration: number) => number;
declare type PageSwitchTransitionString =
    | 'fade'
    | 'slice'
    | 'sliceX'
    | 'sliceY'
    | 'scroll'
    | 'scrollX'
    | 'scrollY'
    | 'scroll3d'
    | 'scroll3dX'
    | 'scroll3dY'
    | 'scrollCover'
    | 'scrollCoverX'
    | 'scrollCoverY'
    | 'scrollCoverReverse'
    | 'scrollCoverReverseX'
    | 'scrollCoverReverseY'
    | 'scrollCoverIn'
    | 'scrollCoverInX'
    | 'scrollCoverInY'
    | 'scrollCoverOut'
    | 'scrollCoverOutX'
    | 'scrollCoverOutY'
    | 'slide'
    | 'slideX'
    | 'slideY'
    | 'slideCover'
    | 'slideCoverX'
    | 'slideCoverY'
    | 'slideCoverReverse'
    | 'slideCoverReverseX'
    | 'slideCoverReverseY'
    | 'slideCoverIn'
    | 'slideCoverInX'
    | 'slideCoverInY'
    | 'slideCoverOut'
    | 'slideCoverOutX'
    | 'slideCoverOutY'
    | 'flow'
    | 'flowX'
    | 'flowY'
    | 'flowCover'
    | 'flowCoverX'
    | 'flowCoverY'
    | 'flowCoverReverse'
    | 'flowCoverReverseX'
    | 'flowCoverReverseY'
    | 'flowCoverIn'
    | 'flowCoverInX'
    | 'flowCoverInY'
    | 'flowCoverOut'
    | 'flowCoverOutX'
    | 'flowCoverOutY'
    | 'zoom'
    | 'zoomX'
    | 'zoomY'
    | 'zoomCover'
    | 'zoomCoverX'
    | 'zoomCoverY'
    | 'zoomCoverReverse'
    | 'zoomCoverReverseX'
    | 'zoomCoverReverseY'
    | 'zoomCoverIn'
    | 'zoomCoverInX'
    | 'zoomCoverInY'
    | 'zoomCoverOut'
    | 'zoomCoverOutX'
    | 'zoomCoverOutY'
    | 'skew'
    | 'skewX'
    | 'skewY'
    | 'skewCover'
    | 'skewCoverX'
    | 'skewCoverY'
    | 'skewCoverReverse'
    | 'skewCoverReverseX'
    | 'skewCoverReverseY'
    | 'skewCoverIn'
    | 'skewCoverInX'
    | 'skewCoverInY'
    | 'skewCoverOut'
    | 'skewCoverOutX'
    | 'skewCoverOutY'
    | 'flip'
    | 'flipX'
    | 'flipY'
    | 'flip3d'
    | 'flip3dX'
    | 'flip3dY'
    | 'flipCoverReverse'
    | 'flipCoverReverseX'
    | 'flipCoverReverseY'
    | 'flipClock'
    | 'flipClockX'
    | 'flipClockY'
    | 'flipCover'
    | 'flipCoverX'
    | 'flipCoverY'
    | 'flipPaper'
    | 'flipPaperX'
    | 'flipPaperY'
    | 'flipCoverIn'
    | 'flipCoverInX'
    | 'flipCoverInY'
    | 'flipCoverOut'
    | 'flipCoverOutX'
    | 'flipCoverOutY'
    | 'bomb'
    | 'bombX'
    | 'bombY'
    | 'bombCover'
    | 'bombCoverX'
    | 'bombCoverY'
    | 'bombCoverReverse'
    | 'bombCoverReverseX'
    | 'bombCoverReverseY'
    | 'bombCoverIn'
    | 'bombCoverInX'
    | 'bombCoverInY'
    | 'bombCoverOut'
    | 'bombCoverOutX'
    | 'bombCoverOutY';

declare type PageSwitchTransitionFunc = (cpage: HTMLElement, cp: number, tpage?: HTMLElement, tp?: number) => void;

declare interface PageSwitchConfig {
    duration?: number;
    direction?: 0 | 1;
    start?: number;
    loop?: boolean;
    mouse?: boolean;
    mousewheel?: boolean;
    interval?: number;
    autoplay?: number;
    arrowkey?: boolean;
    freeze?: boolean;
    ease?: PageSwitchEaseString | PageSwitchEaseFunc;
    transition?: PageSwitchTransitionString | PageSwitchTransitionFunc;
}

declare interface PageSwitch {
    pages: HTMLElement[];
    length: number;
    frozen: boolean;
    arrowkey: boolean;
    playing: boolean;
    interval: number;
    mousewheel: boolean;
    mouse: boolean;
    loop: boolean;
    current: number;
    direction: 0 | 1;
    duration: number;

    setEase(ease: PageSwitchEaseString | PageSwitchEaseFunc): PageSwitch;
    setTransition(transition: PageSwitchTransitionString | PageSwitchTransitionFunc): PageSwitch;

    addEase(name: string, ease: PageSwitchEaseFunc): PageSwitch;
    addTransition(name: string, transition: PageSwitchTransitionFunc): PageSwitch;

    prev(): PageSwitch;
    next(): PageSwitch;
    slide(index: number): PageSwitch;
    play(): PageSwitch;
    pause(): PageSwitch;

    freeze(frozen: boolean): PageSwitch;

    isStatic(): boolean;

    prepend(page: HTMLElement): PageSwitch;
    append(page: HTMLElement): PageSwitch;
    insertBefore(page: HTMLElement, index: number): PageSwitch;
    insertAfter(page: HTMLElement, index: number): PageSwitch;
    remove(index: number): PageSwitch;

    on(action: 'before', callback: (current: number, next: number) => void): PageSwitch;
    on(action: 'after', callback: (current: number, prev: number) => void): PageSwitch;
    on(
        action: 'update',
        callback: (cpage: HTMLElement, cp: number, tpage?: HTMLElement, tp?: number) => void
    ): PageSwitch;
    on(action: 'dragStart' | 'drageMove' | 'dragEnd', callback: (event: any) => void): PageSwitch;

    destroy(): PageSwitch;
}

interface PageSwitchConstructor {
    new (idOrElement: string | HTMLElement, config?: PageSwitchConfig): PageSwitch;
    (idOrElement: string | HTMLElement, config?: PageSwitchConfig): PageSwitch;
}

declare const pageSwitch: PageSwitchConstructor;

export = pageSwitch;

export as namespace pageSwitch;
