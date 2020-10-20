class IntersectionObserver {
    constructor(cb, { root, rootMargin, threshold }){
        this.cb = cb;
        this.root = root;
        this.rootMargin = rootMargin;
        this.threshold = threshold;
        this.elements = [];
    }
    observe(element){
        this.elements.push(element);
    }
    unobserve(element){
        this.elements = this.elements.filter(e => e !== element);
    }
}

module.exports = IntersectionObserver;