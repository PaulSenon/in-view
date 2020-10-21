const InView = require('../index');
const IntersectionObserverMock = require('./__mocks__/IntersectionObserver');

global.IntersectionObserver = IntersectionObserverMock;


describe('InView construct', () => {
    it('Should instantiate without args', () => {
        const inView = new InView();
        expect(inView.rootElement).toBe(undefined);
        expect(inView.events).toStrictEqual(['entering', 'entered', 'leaving', 'left', 'visible']);
        expect(inView.rootMargin).toBe('0px 0px 0px 0px');
        expect(inView.states).toStrictEqual([]);
        expect(inView.intersectionObserver).toBeInstanceOf(IntersectionObserverMock);
        expect(inView.intersectionObserver.cb).toBeInstanceOf(Function);
        expect(inView.intersectionObserver.root).toBe(inView.rootElement);
        expect(inView.intersectionObserver.rootMargin).toBe(inView.rootMargin);
        expect(inView.intersectionObserver.threshold).toStrictEqual([0,1]);
    });
    it('Should instantiate with args', () => {
        const inView = new InView({
            rootElement: 'test',
            rootMarginTop: 1,
            rootMarginRight: 2,
            rootMarginBottom: 3,
            rootMarginLeft: 4, 
        });
        expect(inView.rootElement).toBe('test');
        expect(inView.events).toStrictEqual(['entering', 'entered', 'leaving', 'left', 'visible']);
        expect(inView.rootMargin).toBe('1px 2px 3px 4px');
        expect(inView.states).toStrictEqual([]);
        expect(inView.intersectionObserver).toBeInstanceOf(IntersectionObserverMock);
        expect(inView.intersectionObserver.cb).toBeInstanceOf(Function);
        expect(inView.intersectionObserver.root).toBe(inView.rootElement);
        expect(inView.intersectionObserver.rootMargin).toBe(inView.rootMargin);
        expect(inView.intersectionObserver.threshold).toStrictEqual([0,1]);
    });
});

describe('InView states', () => {

    describe('_getState', () => {
        it('Should return undefined when getState on empty state', () => {
            const inView = new InView();
            const element = 'test';
            expect(inView._getState(element)).toBe(undefined);
        });
        it('Should return undefined when getState on undefined state', () => {
            const inView = new InView();
            const element = 'test3';
            const testState = [
                {element: 'test1'},
                {element: 'test2'}
            ];
            const testStateCopy = [...testState];
            inView.states = testState;
            expect(inView.states).toStrictEqual(testStateCopy);
            expect(inView._getState(element)).toBe(undefined);
            expect(inView.states).toStrictEqual(testStateCopy);
        });
        it('Should getState', () => {
            const inView = new InView();
            const element = 'test2';
            const testState = [
                {element: 'test1'},
                {element: 'test2'}
            ];
            const testStateCopy = [...testState];
            inView.states = testState;
            expect(inView.states).toStrictEqual(testStateCopy);
            expect(inView._getState(element)).toStrictEqual(testStateCopy[1]);
            expect(inView.states).toStrictEqual(testStateCopy);
        });
    });
    
    describe('_getStateCallback', () => {
        it('Should return undefined when getStateCallback on empty state', () => {
            const inView = new InView();
            const element = 'test';
            expect(inView._getStateCallback(element, 'entered')).toBe(undefined);
        });
        it('Should throw Error when getStateCallback with wrong event', () => {
            const inView = new InView();
            const element = 'test';
            expect(() => inView._getStateCallback(element, 'osdjfkshkgjhdfg')).toThrow(Error);
            expect(() => inView._getStateCallback(element)).toThrow(Error);
        });
        it('Should return undefined when getStateCallback on undefined state', () => {
            const inView = new InView();
            const element = 'test1';
            const testCallback = () => 'testCallback';
            const testState = [
                {element: 'test1', callbacks: {entered: testCallback}},
                {element: 'test2', callbacks: {entered: () => {}}}
            ];
            const testStateCopy = [...testState];
            inView.states = testState;
            expect(inView.states).toStrictEqual(testStateCopy);
            expect(inView._getStateCallback(element, 'left')).toBe(undefined);
            expect(inView.states).toStrictEqual(testStateCopy);
        });
        it('Should getStateCallback', () => {
            const inView = new InView();
            const element = 'test1';
            const testCallback = () => 'testCallback';
            const testState = [
                {element: 'test1', callbacks: {entered: testCallback}},
                {element: 'test2', callbacks: {entered: () => {}}}
            ];
            const testStateCopy = [...testState];
            inView.states = testState;
            expect(inView.states).toStrictEqual(testStateCopy);
            expect(inView._getStateCallback(element, 'entered')).toBe(testCallback);
            expect(inView.states).toStrictEqual(testStateCopy);
        });
    });
    
    describe('_addState', () => {
        it('Should not override when addState on existing state', () => {
            const inView = new InView();
            const element = 'test1';
            const testState = [
                {element: 'test1', isEntered: 'test', callbacks: {entered: () => {}}},
                {element: 'test2', callbacks: {entered: () => {}}}
            ];
            const testStateCopy = [...testState];
            inView.states = testState;
            expect(inView.states).toStrictEqual(testStateCopy);
            inView._addState(element)
            expect(inView.states).toStrictEqual(testStateCopy);
        });
        it('Should addState', () => {
            const inView = new InView();
            const element = 'testNew';
            const testState = [
                {element: 'test1', isEntered: 'test', callbacks: {entered: () => {}}},
                {element: 'test2', callbacks: {entered: () => {}}}
            ];
            const testStateCopy = [...testState];
            inView.states = testState;
            expect(inView.states).toStrictEqual(testStateCopy);
            inView._addState(element)
            expect(inView.states).toStrictEqual([
                ...testStateCopy, 
                {element: 'testNew', isEntered: false, callbacks: {}}
            ]);
        });
    });
    
    describe('_addStateCallback', () => {
        it('Should not override when addStateCallback on existing callback state', () => {
            const inView = new InView();
            const element = 'test1';
            const testCallback = () => 'testCallback';
            const testState = [
                {element: 'test1', isEntered: 'test', callbacks: {entered: () => {}}},
                {element: 'test2', callbacks: {entered: () => {}}}
            ];
            const testStateCopy = [...testState];
            inView.states = testState;
            expect(inView.states).toStrictEqual(testStateCopy);
            inView._addStateCallback(element, 'entered', testCallback);
            expect(inView.states).toStrictEqual(testStateCopy);
        });
        it('Should throw Error when addStateCallback with wrong event', () => {
            const inView = new InView();
            const element = 'test';
            const testCallback = () => 'testCallback';
            expect(() => inView._addStateCallback(element, 'osdjfkshkgjhdfg', testCallback)).toThrow(Error);
            expect(() => inView._addStateCallback(element)).toThrow(Error);
        });
        it('Should addStateCallback', () => {
            const inView = new InView();
            const element = 'test1';
            const testCallback = () => 'testCallback';
            const testState = [
                {element: 'test1', isEntered: 'test', callbacks: {entered: () => {}}},
                {element: 'test2', callbacks: {entered: () => {}}}
            ];
            const testStateCopy = [...testState];
            inView.states = testState;
            expect(inView.states).toStrictEqual(testStateCopy);
            inView._addStateCallback(element, 'left', testCallback);
            expect(JSON.stringify(inView.states)).toBe(JSON.stringify([
                {element: 'test1', isEntered: 'test', callbacks: {entered: () => {}, left: testCallback}},
                {element: 'test2', callbacks: {entered: () => {}}}
            ]));
        });
        it('Should add state before addStateCallback', () => {
            const inView = new InView();
            const element = 'testNew';
            const testCallback = () => 'testCallback';
            const testState = [
                {element: 'test1', isEntered: 'test', callbacks: {entered: () => {}}},
                {element: 'test2', callbacks: {entered: () => {}}}
            ];
            const testStateCopy = [...testState];
            inView.states = testState;
            expect(inView.states).toStrictEqual(testStateCopy);
            inView._addStateCallback(element, 'left', testCallback);
            expect(inView.states).toStrictEqual([
                ...testStateCopy,
                {element: 'testNew', isEntered: false, callbacks: {left: testCallback}},
            ]);
        });
    });
    
    describe('_removeState', () => {
        it('Should work if removeState on empty states', () => {
            const inView = new InView();
            const element = 'test';
            expect(inView.states).toStrictEqual([]);
            inView._removeState(element)
            expect(inView.states).toStrictEqual([]);
        });
        it('Should removeState', () => {
            const inView = new InView();
            const element = 'test1';
            const testState = [
                {element: 'test1', isEntered: 'test', callbacks: {entered: () => {}}},
                {element: 'test2', callbacks: {entered: () => {}}}
            ];
            inView.states = testState;
            expect(inView.states).toStrictEqual(testState);
            inView._removeState(element);
            expect(inView.states).toStrictEqual([testState[1]]);
            inView._removeState('test2');
            expect(inView.states).toStrictEqual([]);
        });
    });
    
    describe('_removeStateCallback', () => {
        it('Should work if removeStateCallback on empty state', () => {
            const inView = new InView();
            const element = 'test';
            expect(inView.states).toStrictEqual([]);
            inView._removeStateCallback(element, 'entered')
            expect(inView.states).toStrictEqual([]);
        });
        it('Should throw Error when removeStateCallback with wrong event', () => {
            const inView = new InView();
            const element = 'test';
            expect(() => inView._removeStateCallback(element, 'osdjfkshkgjhdfg')).toThrow(Error);
            expect(() => inView._removeStateCallback(element)).toThrow(Error);
        });
        it('Should work if removeStateCallback on empty callback state', () => {
            const inView = new InView();
            const element = 'test1';
            const testState = [
                {element: 'test1', isEntered: 'test', callbacks: {entered: () => {}}},
                {element: 'test2', callbacks: {entered: () => {}}}
            ];
            const testStateCopy = [...testState];
            inView.states = testState;
            expect(inView.states).toStrictEqual(testStateCopy);
            inView._removeStateCallback(element, 'left')
            expect(inView.states).toStrictEqual(testStateCopy);
        });
        it('Should removeStateCallback', () => {
            const inView = new InView();
            const element = 'test1';
            const testState = [
                {element: 'test1', isEntered: 'test', callbacks: {entered: () => {}, left: () => {}}},
                {element: 'test2', callbacks: {entered: () => {}}}
            ];
            const testStateCopy = [...testState];
            inView.states = testState;
            expect(inView.states).toStrictEqual(testStateCopy);
            inView._removeStateCallback(element, 'entered')
            expect(JSON.stringify(inView.states)).toBe(JSON.stringify([
                {element: 'test1', isEntered: 'test', callbacks: {left: () => {}}},
                {element: 'test2', callbacks: {entered: () => {}}}
            ]));
        });
    });
});

describe('InView tools', () => {
    describe('_toArray', () => {
        it('Should convert single element to array', () => {
            const inView = new InView();
            const testValue = 'test';
            expect(inView._toArray(testValue)).toStrictEqual([testValue]);
        });
        it('Should do nothing on array', () => {
            const inView = new InView();
            const testValue = ['test1', 'test2'];
            expect(inView._toArray(testValue)).toStrictEqual(testValue);
        });
        it('Should cast HTMLCollection to array', () => {
            const inView = new InView();
            const docFragment = document.createDocumentFragment();
            const node1 = document.createElement('test1');
            const node2 = document.createElement('test2')
            docFragment.appendChild(node1);
            docFragment.appendChild(node2);
            const myHTMLCollection = docFragment.children;
            expect(inView._toArray(myHTMLCollection)).toStrictEqual([node1, node2]);
        });
    });
});

describe('InView public methods', () => {
    describe('on', () => {
        it('Should throw Error if wrong event', () => {
            const inView = new InView();
            const testElement = 'test';
            const testCallback1 = () => 'testCallback1';
            expect(() =>inView.on('dkgjdlsfjg', testElement, testCallback1)).toThrow(Error);
        });

        describe('multiple elements', () => {
            it('Should add multiple elements callback', () => {
                const inView = new InView();
                const testElements = ['test1', 'test2'];
                const testCallback1 = () => 'testCallback1';
                
                inView.on('entered', testElements, testCallback1);
                expect(inView.states).toStrictEqual([
                    {element: testElements[0], isEntered: false, callbacks: {entered: testCallback1}},
                    {element: testElements[1], isEntered: false, callbacks: {entered: testCallback1}}
                ]);
                expect(inView.intersectionObserver.elements.length).toBe(2);
            });
            it('Should add multiple time multiple elements callback', () => {
                const inView = new InView();
                const testElements = ['test1', 'test2'];
                const testCallback1 = () => 'testCallback1';
                const testCallback2 = () => 'testCallback2';
    
                inView.on('entered', testElements, testCallback1);
                expect(inView.states).toStrictEqual([
                    {element: testElements[0], isEntered: false, callbacks: {entered: testCallback1}},
                    {element: testElements[1], isEntered: false, callbacks: {entered: testCallback1}}
                ]);
                expect(inView.intersectionObserver.elements.length).toBe(2);
    
                // one more event
                inView.on('leaving', testElements, testCallback2);
                expect(inView.states).toStrictEqual([
                    {element: testElements[0], isEntered: false, callbacks: {entered: testCallback1, leaving: testCallback2}},
                    {element: testElements[1], isEntered: false, callbacks: {entered: testCallback1, leaving: testCallback2}}
                ]);
                expect(inView.intersectionObserver.elements.length).toBe(2);
            });    
            it('Should redefine multiple elements event callback', () => {
                const inView = new InView();
                const testEvent = 'entered';
                const testElements = ['test1', 'test2'];
                const testCallback1 = () => 'testCallback1';
                const testCallback2 = () => 'testCallback2';
                
                inView.on(testEvent, testElements, testCallback1);
                expect(inView.states).toStrictEqual([
                    {element: testElements[0], isEntered: false, callbacks: {entered: testCallback1}},
                    {element: testElements[1], isEntered: false, callbacks: {entered: testCallback1}}
                ]);
                expect(inView.intersectionObserver.elements.length).toBe(2);
    
                // rewrite one callback
                inView.on(testEvent, testElements, testCallback2);
                expect(inView.states).toStrictEqual([
                    {element: testElements[0], isEntered: false, callbacks: {entered: testCallback2}},
                    {element: testElements[1], isEntered: false, callbacks: {entered: testCallback2}}
                ]);
                expect(inView.intersectionObserver.elements.length).toBe(2);
            });   
        });

        describe('single element', () => {
            it('Should add one element callback', () => {
                const inView = new InView();
                const testElement = 'test';
                const testCallback1 = () => 'testCallback1';
                
                inView.on('entered', testElement, testCallback1);
                expect(inView.states).toStrictEqual([
                    {element: testElement, isEntered: false, callbacks: {entered: testCallback1}}
                ]);
                expect(inView.intersectionObserver.elements.length).toBe(1);
            });
            it('Should add multiple time one element callback', () => {
                const inView = new InView();
                const testElement = 'test';
                const testCallback1 = () => 'testCallback1';
                const testCallback2 = () => 'testCallback2';
                
                inView.on('entered', testElement, testCallback1);
                expect(inView.states).toStrictEqual([
                    {element: testElement, isEntered: false, callbacks: {entered: testCallback1}}
                ]);
                expect(inView.intersectionObserver.elements.length).toBe(1);
                inView.on('left', testElement, testCallback2);
                expect(inView.states).toStrictEqual([
                    {element: testElement, isEntered: false, callbacks: {entered: testCallback1, left: testCallback2}},
                ]);
                expect(inView.intersectionObserver.elements.length).toBe(1);
            });    
            it('Should redefine one element event callback', () => {
                const inView = new InView();
                const testEvent = 'entered';
                const testElement = 'test';
                const testCallback1 = () => 'testCallback1';
                const testCallback2 = () => 'testCallback2';
                
                inView.on(testEvent, testElement, testCallback1);
                expect(inView.states).toStrictEqual([
                    {element: testElement, isEntered: false, callbacks: {entered: testCallback1}}
                ]);
                expect(inView.intersectionObserver.elements.length).toBe(1);
                inView.on(testEvent, testElement, testCallback2);
                expect(inView.states).toStrictEqual([
                    {element: testElement, isEntered: false, callbacks: {entered: testCallback2}},
                ]);
                expect(inView.intersectionObserver.elements.length).toBe(1);
            });   
        });

    }); 

    describe('shortcut methods', () => {
        it('Should add onEntered', () => {
            const inView = new InView();
            const testElements = ['test1', 'test2'];
            const testCallback1 = () => 'testCallback1';
            const testCallback2 = () => 'testCallback2';

            inView.onEntered(testElements, testCallback1);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {entered: testCallback1}},
                {element: testElements[1], isEntered: false, callbacks: {entered: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);

            // rewrite one to test we can also pass one element
            inView.onEntered(testElements[0], testCallback2);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {entered: testCallback2}},
                {element: testElements[1], isEntered: false, callbacks: {entered: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);
        });
        it('Should add onEntering', () => {
            const inView = new InView();
            const testElements = ['test1', 'test2'];
            const testCallback1 = () => 'testCallback1';
            const testCallback2 = () => 'testCallback2';

            inView.onEntering(testElements, testCallback1);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {entering: testCallback1}},
                {element: testElements[1], isEntered: false, callbacks: {entering: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);

            // rewrite one to test we can also pass one element
            inView.onEntering(testElements[0], testCallback2);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {entering: testCallback2}},
                {element: testElements[1], isEntered: false, callbacks: {entering: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);
        });
        it('Should add onLeaving', () => {
            const inView = new InView();
            const testElements = ['test1', 'test2'];
            const testCallback1 = () => 'testCallback1';
            const testCallback2 = () => 'testCallback2';

            inView.onLeaving(testElements, testCallback1);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {leaving: testCallback1}},
                {element: testElements[1], isEntered: false, callbacks: {leaving: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);

            // rewrite one to test we can also pass one element
            inView.onLeaving(testElements[0], testCallback2);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {leaving: testCallback2}},
                {element: testElements[1], isEntered: false, callbacks: {leaving: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);
        });
        it('Should add onLeft', () => {
            const inView = new InView();
            const testElements = ['test1', 'test2'];
            const testCallback1 = () => 'testCallback1';
            const testCallback2 = () => 'testCallback2';

            inView.onLeft(testElements, testCallback1);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {left: testCallback1}},
                {element: testElements[1], isEntered: false, callbacks: {left: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);

            // rewrite one to test we can also pass one element
            inView.onLeft(testElements[0], testCallback2);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {left: testCallback2}},
                {element: testElements[1], isEntered: false, callbacks: {left: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);
        });
        it('Should add onVisible', () => {
            const inView = new InView();
            const testElements = ['test1', 'test2'];
            const testCallback1 = () => 'testCallback1';
            const testCallback2 = () => 'testCallback2';

            inView.onVisible(testElements, testCallback1);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {visible: testCallback1}},
                {element: testElements[1], isEntered: false, callbacks: {visible: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);

            // rewrite one to test we can also pass one element
            inView.onVisible(testElements[0], testCallback2);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {visible: testCallback2}},
                {element: testElements[1], isEntered: false, callbacks: {visible: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);
        });
        it('Should add onNotVisible (alias onLeft)', () => {
            const inView = new InView();
            const testElements = ['test1', 'test2'];
            const testCallback1 = () => 'testCallback1';
            const testCallback2 = () => 'testCallback2';

            inView.onNotVisible(testElements, testCallback1);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {left: testCallback1}},
                {element: testElements[1], isEntered: false, callbacks: {left: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);

            // rewrite one to test we can also pass one element
            inView.onNotVisible(testElements[0], testCallback2);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {left: testCallback2}},
                {element: testElements[1], isEntered: false, callbacks: {left: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);
        });
    });

    describe('unobserve', () => {
        it('Should not break if empty state', () => {
            const inView = new InView();
            const testElement = 'test';
            
            expect(inView.states).toStrictEqual([]);
            expect(inView.intersectionObserver.elements.length).toBe(0);
            inView.unobserve(testElement);
            expect(inView.states).toStrictEqual([]);
            expect(inView.intersectionObserver.elements.length).toBe(0);
        });
        it('Should unobserve an clear state for selected element', () => {
            const inView = new InView();
            const testElements = ['test1', 'test2'];
            const testCallback1 = () => 'testCallback1';
            
            inView.on('entered', testElements, testCallback1);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {entered: testCallback1}},
                {element: testElements[1], isEntered: false, callbacks: {entered: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);

            inView.unobserve(testElements[0]);
            expect(inView.states).toStrictEqual([
                {element: testElements[1], isEntered: false, callbacks: {entered: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(1);
        });
    });
    
    describe('unobserveEvent', () => {
        it('Should throw Error if wrong event ', () => {
            const inView = new InView();
            const testElement = 'test';
            
            expect(() => inView.unobserveEvent(testElement, 'qdgfhfgsfghfs')).toThrow(Error);
        });
        it('Should not break if element does not exist', () => {
            const inView = new InView();
            const testElement = 'test';
            
            expect(inView.states).toStrictEqual([]);
            expect(inView.intersectionObserver.elements.length).toBe(0);
            inView.unobserveEvent(testElement, 'entered');
            expect(inView.states).toStrictEqual([]);
            expect(inView.intersectionObserver.elements.length).toBe(0);
        });
        it('Should remove state when no more events', () => {
            const inView = new InView();
            const testElement = 'test';
            const testCallback1 = () => 'testCallback1';
            const testCallback2 = () => 'testCallback2';
            
            inView.on('entered', testElement, testCallback1);
            expect(inView.states).toStrictEqual([
                {element: testElement, isEntered: false, callbacks: {entered: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(1);

            inView.on('left', testElement, testCallback2);
            expect(inView.states).toStrictEqual([
                {element: testElement, isEntered: false, callbacks: {entered: testCallback1, left: testCallback2}},
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(1);

            inView.unobserveEvent(testElement, 'entered');
            expect(inView.states).toStrictEqual([
                {element: testElement, isEntered: false, callbacks: {left: testCallback2}},
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(1);

            inView.unobserveEvent(testElement, 'left');
            expect(inView.states).toStrictEqual([]);
            expect(inView.intersectionObserver.elements.length).toBe(0);
        });    
    });

    describe('unobserveAll', () => {
        it('Should not break if empty state', () => {
            const inView = new InView();
            
            expect(inView.states).toStrictEqual([]);
            expect(inView.intersectionObserver.elements.length).toBe(0);
            inView.unobserveAll();
            expect(inView.states).toStrictEqual([]);
            expect(inView.intersectionObserver.elements.length).toBe(0);
        });
        it('Should unobserve all an clear states', () => {
            const inView = new InView();
            const testElements = ['test1', 'test2'];
            const testCallback1 = () => 'testCallback1';
            const testCallback2 = () => 'testCallback2';
            
            inView.on('entered', testElements, testCallback1);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {entered: testCallback1}},
                {element: testElements[1], isEntered: false, callbacks: {entered: testCallback1}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);

            // add another event callback
            inView.on('leaving', testElements, testCallback2);
            expect(inView.states).toStrictEqual([
                {element: testElements[0], isEntered: false, callbacks: {entered: testCallback1, leaving: testCallback2}},
                {element: testElements[1], isEntered: false, callbacks: {entered: testCallback1, leaving: testCallback2}}
            ]);
            expect(inView.intersectionObserver.elements.length).toBe(2);

            // unobserve all
            inView.unobserveAll();
            expect(inView.states).toStrictEqual([]);
            expect(inView.intersectionObserver.elements.length).toBe(0);
        });
    });
});

describe('InView IntersectionObserver callback', () => {
    it('Should detected ENTERED', () => {
        const inView = new InView();
        const testElements = ['test1', 'test2', 'test3'];
        const testCallbackEntered = jest.fn();
        const testCallbackEntering = jest.fn();
        const testCallbackLeaving = jest.fn();
        const testCallbackLeft = jest.fn();
        const testCallbackVisible = jest.fn();
        
        inView.onEntered(testElements, testCallbackEntered);
        inView.onEntering(testElements, testCallbackEntering);
        inView.onLeaving(testElements, testCallbackLeaving);
        inView.onLeft(testElements, testCallbackLeft);
        inView.onVisible(testElements, testCallbackVisible);

        // assume two are "entered"
        const testEntries = [
            {
                intersectionRatio: 1,
                isIntersecting: true,
                target: testElements[0],
            },
            {
                intersectionRatio: 1,
                isIntersecting: false,
                target: testElements[2],
            },
        ];

        inView.intersectionObserver.cb(testEntries);

        expect(inView._getState(testElements[0]).isEntered).toBe(true);
        expect(inView._getState(testElements[1]).isEntered).toBe(false);
        expect(inView._getState(testElements[2]).isEntered).toBe(true);

        expect(testCallbackEntered).toHaveBeenCalledTimes(2);
        expect(testCallbackEntering).toHaveBeenCalledTimes(0);
        expect(testCallbackLeaving).toHaveBeenCalledTimes(0);
        expect(testCallbackLeft).toHaveBeenCalledTimes(0);
        expect(testCallbackVisible).toHaveBeenCalledTimes(2);
    });
    it('Should detected ENTERING', () => {
        const inView = new InView();
        const testElements = ['test1', 'test2', 'test3'];
        const testCallbackEntered = jest.fn();
        const testCallbackEntering = jest.fn();
        const testCallbackLeaving = jest.fn();
        const testCallbackLeft = jest.fn();
        const testCallbackVisible = jest.fn();
        
        inView.onEntered(testElements, testCallbackEntered);
        inView.onEntering(testElements, testCallbackEntering);
        inView.onLeaving(testElements, testCallbackLeaving);
        inView.onLeft(testElements, testCallbackLeft);
        inView.onVisible(testElements, testCallbackVisible);

        // manually set isEntered to false
        inView._getState(testElements[0]).isEntered = false;
        inView._getState(testElements[2]).isEntered = false;

        // assume two are "entering"
        const testEntries = [
            {
                intersectionRatio: 0.5,
                isIntersecting: true,
                target: testElements[0],
            },
            {
                intersectionRatio: 0.5,
                isIntersecting: true,
                target: testElements[2],
            },
        ];

        inView.intersectionObserver.cb(testEntries);

        expect(inView._getState(testElements[0]).isEntered).toBe(false);
        expect(inView._getState(testElements[1]).isEntered).toBe(false);
        expect(inView._getState(testElements[2]).isEntered).toBe(false);

        expect(testCallbackEntered).toHaveBeenCalledTimes(0);
        expect(testCallbackEntering).toHaveBeenCalledTimes(2);
        expect(testCallbackLeaving).toHaveBeenCalledTimes(0);
        expect(testCallbackLeft).toHaveBeenCalledTimes(0);
        expect(testCallbackVisible).toHaveBeenCalledTimes(2);
    });
    it('Should detected LEAVING', () => {
        const inView = new InView();
        const testElements = ['test1', 'test2', 'test3'];
        const testCallbackEntered = jest.fn();
        const testCallbackEntering = jest.fn();
        const testCallbackLeaving = jest.fn();
        const testCallbackLeft = jest.fn();
        const testCallbackVisible = jest.fn();
        
        inView.onEntered(testElements, testCallbackEntered);
        inView.onEntering(testElements, testCallbackEntering);
        inView.onLeaving(testElements, testCallbackLeaving);
        inView.onLeft(testElements, testCallbackLeft);
        inView.onVisible(testElements, testCallbackVisible);

        // manually set isEntered to true
        inView._getState(testElements[0]).isEntered = true;
        inView._getState(testElements[2]).isEntered = true;

        // assume two are "entering"
        const testEntries = [
            {
                intersectionRatio: 0.5,
                isIntersecting: true,
                target: testElements[0],
            },
            {
                intersectionRatio: 0.5,
                isIntersecting: true,
                target: testElements[2],
            },
        ];

        inView.intersectionObserver.cb(testEntries);

        expect(inView._getState(testElements[0]).isEntered).toBe(true);
        expect(inView._getState(testElements[1]).isEntered).toBe(false);
        expect(inView._getState(testElements[2]).isEntered).toBe(true);

        expect(testCallbackEntered).toHaveBeenCalledTimes(0);
        expect(testCallbackEntering).toHaveBeenCalledTimes(0);
        expect(testCallbackLeaving).toHaveBeenCalledTimes(2);
        expect(testCallbackLeft).toHaveBeenCalledTimes(0);
        expect(testCallbackVisible).toHaveBeenCalledTimes(2);
    });
    it('Should detected LEFT', () => {
        const inView = new InView();
        const testElements = ['test1', 'test2', 'test3'];
        const testCallbackEntered = jest.fn();
        const testCallbackEntering = jest.fn();
        const testCallbackLeaving = jest.fn();
        const testCallbackLeft = jest.fn();
        const testCallbackVisible = jest.fn();
        
        inView.onEntered(testElements, testCallbackEntered);
        inView.onEntering(testElements, testCallbackEntering);
        inView.onLeaving(testElements, testCallbackLeaving);
        inView.onLeft(testElements, testCallbackLeft);
        inView.onVisible(testElements, testCallbackVisible);

        // manually set isEntered to true
        inView._getState(testElements[0]).isEntered = true;
        inView._getState(testElements[2]).isEntered = true;

        // assume two are "entering"
        const testEntries = [
            {
                intersectionRatio: 0,
                isIntersecting: false,
                target: testElements[0],
            },
            {
                intersectionRatio: 0,
                isIntersecting: true,
                target: testElements[2],
            },
        ];

        inView.intersectionObserver.cb(testEntries);

        expect(inView._getState(testElements[0]).isEntered).toBe(false);
        expect(inView._getState(testElements[1]).isEntered).toBe(false);
        expect(inView._getState(testElements[2]).isEntered).toBe(false);

        expect(testCallbackEntered).toHaveBeenCalledTimes(0);
        expect(testCallbackEntering).toHaveBeenCalledTimes(0);
        expect(testCallbackLeaving).toHaveBeenCalledTimes(0);
        expect(testCallbackLeft).toHaveBeenCalledTimes(2);
        expect(testCallbackVisible).toHaveBeenCalledTimes(0);
    });
    it('Should detected VISIBLE', () => {
        const inView = new InView();
        const testElements = ['test1', 'test2', 'test3', 'test4'];
        const testCallbackEntered = jest.fn();
        const testCallbackEntering = jest.fn();
        const testCallbackLeaving = jest.fn();
        const testCallbackLeft = jest.fn();
        const testCallbackVisible = jest.fn();
        
        inView.onEntered(testElements, testCallbackEntered);
        inView.onEntering(testElements, testCallbackEntering);
        inView.onLeaving(testElements, testCallbackLeaving);
        inView.onLeft(testElements, testCallbackLeft);
        inView.onVisible(testElements, testCallbackVisible);

        // manually set isEntered to true for 'leaving')
        inView._getState(testElements[2]).isEntered = true;

        // assume two are "entered"
        const testEntries = [
            { // will trigger ENTERED && VISIBLE
                intersectionRatio: 1, // important
                isIntersecting: false,
                target: testElements[0],
            },
            { // will trigger ENTERING && VISIBLE
                intersectionRatio: 0.5, // important
                isIntersecting: true, // important
                target: testElements[1],
            },
            { // will trigger LEAVING && VISIBLE
                intersectionRatio: 0.5, // important
                isIntersecting: true, // important
                target: testElements[2],
            },
            { // will trigger LEFT
                intersectionRatio: 0, // important
                isIntersecting: true,
                target: testElements[3],
            },
        ];

        inView.intersectionObserver.cb(testEntries);

        expect(inView._getState(testElements[0]).isEntered).toBe(true);
        expect(inView._getState(testElements[1]).isEntered).toBe(false);
        expect(inView._getState(testElements[2]).isEntered).toBe(true);
        expect(inView._getState(testElements[1]).isEntered).toBe(false);

        expect(testCallbackEntered).toHaveBeenCalledTimes(1);
        expect(testCallbackEntering).toHaveBeenCalledTimes(1);
        expect(testCallbackLeaving).toHaveBeenCalledTimes(1);
        expect(testCallbackLeft).toHaveBeenCalledTimes(1);
        expect(testCallbackVisible).toHaveBeenCalledTimes(3);
    });
    it('Should not break if one callback is not defined (1)', () => {
        const inView = new InView();
        const testElements = ['test1', 'test2', 'test3', 'test4'];
        const testCallbackVisible = jest.fn();
        
        inView.onVisible(testElements, testCallbackVisible);

        // manually set isEntered to true for 'leaving')
        inView._getState(testElements[2]).isEntered = true;

        // assume two are "entered"
        const testEntries = [
            { // will trigger ENTERED && VISIBLE
                intersectionRatio: 1, // important
                isIntersecting: false,
                target: testElements[0],
            },
            { // will trigger ENTERING && VISIBLE
                intersectionRatio: 0.5, // important
                isIntersecting: true, // important
                target: testElements[1],
            },
            { // will trigger LEAVING && VISIBLE
                intersectionRatio: 0.5, // important
                isIntersecting: true, // important
                target: testElements[2],
            },
            { // will trigger LEFT
                intersectionRatio: 0, // important
                isIntersecting: true,
                target: testElements[3],
            },
        ];

        inView.intersectionObserver.cb(testEntries);

        expect(inView._getState(testElements[0]).isEntered).toBe(true);
        expect(inView._getState(testElements[1]).isEntered).toBe(false);
        expect(inView._getState(testElements[2]).isEntered).toBe(true);
        expect(inView._getState(testElements[1]).isEntered).toBe(false);

        expect(testCallbackVisible).toHaveBeenCalledTimes(3);
    });
    it('Should not break if one callback is not defined (2)', () => {
        const inView = new InView();
        const testElements = ['test1', 'test2', 'test3', 'test4'];
        const testCallbackEntered = jest.fn();
        const testCallbackEntering = jest.fn();
        const testCallbackLeaving = jest.fn();
        const testCallbackVisible = jest.fn();
        
        inView.onEntered(testElements, testCallbackEntered);
        inView.onEntering(testElements, testCallbackEntering);
        inView.onLeaving(testElements, testCallbackLeaving);

        // manually set isEntered to true for 'leaving')
        inView._getState(testElements[2]).isEntered = true;

        // assume two are "entered"
        const testEntries = [
            { // will trigger ENTERED && VISIBLE
                intersectionRatio: 1, // important
                isIntersecting: false,
                target: testElements[0],
            },
            { // will trigger ENTERING && VISIBLE
                intersectionRatio: 0.5, // important
                isIntersecting: true, // important
                target: testElements[1],
            },
            { // will trigger LEAVING && VISIBLE
                intersectionRatio: 0.5, // important
                isIntersecting: true, // important
                target: testElements[2],
            },
            { // will trigger LEFT
                intersectionRatio: 0, // important
                isIntersecting: true,
                target: testElements[3],
            },
        ];

        inView.intersectionObserver.cb(testEntries);

        expect(inView._getState(testElements[0]).isEntered).toBe(true);
        expect(inView._getState(testElements[1]).isEntered).toBe(false);
        expect(inView._getState(testElements[2]).isEntered).toBe(true);
        expect(inView._getState(testElements[1]).isEntered).toBe(false);

        expect(testCallbackEntered).toHaveBeenCalledTimes(1);
        expect(testCallbackEntering).toHaveBeenCalledTimes(1);
        expect(testCallbackLeaving).toHaveBeenCalledTimes(1);
    });
    it('Should break if nothing defined', () => {
        const inView = new InView();
        const testElements = ['test1', 'test2', 'test3', 'test4'];
        
        inView.states = [
            { // will trigger ENTERED
                element: testElements[0],
                isEntered: false,
                callbacks: {}
            },
            { // will trigger ENTERING
                element: testElements[1],
                isEntered: false, // important
                callbacks: {}
            },
            { // will trigger LEAVING
                element: testElements[2],
                isEntered: true, // important
                callbacks: {}
            },
            { // will trigger LEFT
                element: testElements[3],
                isEntered: false,
                callbacks: {}
            },
        ];

        // build test entries for intersection observer callback
        const testEntries = [
            { // will trigger ENTERED
                intersectionRatio: 1, // important
                isIntersecting: false,
                target: testElements[0],
            },
            { // will trigger ENTERING
                intersectionRatio: 0.5, // important
                isIntersecting: true, // important
                target: testElements[1],
            },
            { // will trigger LEAVING
                intersectionRatio: 0.5, // important
                isIntersecting: true, // important
                target: testElements[2],
            },
            { // will trigger LEFT
                intersectionRatio: 0, // important
                isIntersecting: true,
                target: testElements[3],
            },
        ];

        expect(() => inView.intersectionObserver.cb(testEntries)).not.toThrow(Error);

        expect(inView._getState(testElements[0]).isEntered).toBe(true); // has been change
        expect(inView._getState(testElements[1]).isEntered).toBe(false);
        expect(inView._getState(testElements[2]).isEntered).toBe(true);
        expect(inView._getState(testElements[3]).isEntered).toBe(false);
    });
    it('Should not trigger anything if in undetermined intersection state', () => {
        const inView = new InView();
        const testElement = 'test1';
        const testCallbackEntered = jest.fn();
        const testCallbackEntering = jest.fn();
        const testCallbackLeaving = jest.fn();
        const testCallbackLeft = jest.fn();
        const testCallbackVisible = jest.fn();
        
        inView.onEntered(testElement, testCallbackEntered);
        inView.onEntering(testElement, testCallbackEntering);
        inView.onLeaving(testElement, testCallbackLeaving);
        inView.onLeft(testElement, testCallbackLeft);
        inView.onVisible(testElement, testCallbackVisible);

        // assume two are "entering"
        const testEntries = [
            {
                intersectionRatio: 0.5, // important
                isIntersecting: false, // important
                target: testElement,
            }
        ];

        inView.intersectionObserver.cb(testEntries);

        expect(inView._getState(testElement).isEntered).toBe(false);

        expect(testCallbackEntered).toHaveBeenCalledTimes(0);
        expect(testCallbackEntering).toHaveBeenCalledTimes(0);
        expect(testCallbackLeaving).toHaveBeenCalledTimes(0);
        expect(testCallbackLeft).toHaveBeenCalledTimes(0);
        expect(testCallbackVisible).toHaveBeenCalledTimes(0);
    });
});
