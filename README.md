# What is this ?

Because the 'in-view' lib used over different euronews-front apps is no longer maintained and has issues, we decided to create our own version, using IntersectionObserver for better performances.

# To do what ?

Mainly to lazyload stuff, but if can also be used to deactivate/unload stuff that are no more on screen since you'll be able to register callback to 4 different events:

* 'entering' (when something is coming inside the viewport)
* 'entered' (when something is plainly in the viewport)
* 'leaving' (when something is leaving the viewport)
* 'left' (when something is plainly outside of the viewport)

# How do I use it ?

### 1) install the lib

First make sure you have an ssh access to euronews's bitbucket. (if you git push/pull/... from a bash, on one of euronews's repositories, without typing your login/password, it is the case).

Then: 

* `$ yarn add git+ssh://git@bitbucket.org/euronews-sdd/in-view.git#WANTED_VERSION`

OR

* `$ npm install git+ssh://git@bitbucket.org/euronews-sdd/in-view.git#WANTED_VERSION`

Mind to replace `WANTED_VERSION` by a valid tag or branch name (e.g. `1.0.0` or `master`);

### 2) Require it where you need it

In some js file you'll have to import the lib `InView` class.
Here you may want to use the `import` or `require` syntax:

#### import

* `import InView from 'in-view';`

#### require

* `const InView = require('in-view');`

### 3) Use it  (doc and examples)

Now that you have access to the InView class you can make instances such as:

```JavaScript
const inView = new InView({
    rootElement: document.getElementById('my-observer-zone'),
    rootMarginTop: 1,
    rootMarginRight: 2,
    rootMarginBottom: 3,
    rootMarginLeft: 4, 
});
```

It takes an object as unique parameter. 
Here is the doc for each property:

| Property | Type | Default | Description |
|:---------|:-----|:--------|:------------|
|`rootElement`|**DOM element**|viewport|The area that will trigger your callbacks when other element intersect it. By default it's the viewport, so let it blank if you just need basic lazyload :)|
|`rootMarginTop`|**number** (in px)|`0`|Used to extend the observer hitbox on top. You can set both positive or negative values.|
|`rootMarginRight`|**number** (in px)|`0`|Used to extend the observer hitbox on right. You can set both positive or negative values.|
|`rootMarginBottom`|**number** (in px)|`0`|Used to extend the observer hitbox on bottom. **This is typically the prop you'll set in a basic lazyload scenario. A positive value will make callback triggered before you see the element in viewport.** You can set both positive or negative values.|
|`rootMarginLeft`|**number** (in px)|`0`|Used to extend the observer hitbox on left. You can set both positive or negative values.|

Because all properties are optional, the following instantiation is totally valid, and will trigger any callback for stuff that enter/leave the viewport (without any offsets/margins).

```JavaScript
const inView = new InView();
```

Then here is how can use this lib for a basic lazyload of images 200px before they enter the viewport:

```JavaScript
const inView = new InView({ rootMarginBottom: 200 });

const myObjectsToLazyload = [...document.querySelectorAll('img.lazyload')]; // I cast it as a real js array because querySelectorAll does not return a clean one)

inView.onEntering(myObjectToLazyload, (entry) => {
    const element = entry.target;
    element.src = element.dataset.src; // For example, if images, I just switch the data-src in src so the picture loads

    // here we don't wank to trigger one lazyloaded image anymore so we unregister it
    inView.unobserveEvent(element, 'entering');
    // since here we did not registered callback on other events than 'entering', you can simply do: inView.unobserve()
});
```

From your `InView` instance you have access to several methods. Here is the detail:

### The registering methods:

They are used to register a callback to a specific intersection event with the  inView rootElement

* `onEntered(elementOrElements, callback)`
* `onEntering(elementOrElements, callback)`
* `onLeaving(elementOrElements, callback)`
* `onLeft(elementOrElements, callback)`

| Parameter | Type | Default | Description |
|:----------|:-----|:--------|:------------|
|`elementOrElements`|Array\<DomElem\> \|\| DomElem|**REQUIRED**|The element(s) to observe|
|`callback`|Function|**REQUIRED**|The callback giving you the `entry` object from IntersectionObserver as param. You can access the triggering DomElem by accessing `entry.target`|

### The UNregistering methods:

They are used to unregister callback on different levels:

* `unobserveAll()`: To unregister all callbacks of all observed elements. Basically reset your InView instance.
* `unobserve(elementOrElements)`: To unregister all callbacks of a single (or a group) of element(s) (Because you may have mutiple callback for one event: e.g. 'entering', 'leaving')
* `unobserveEvent(elementOrElements, event)`: To unregister on single callback on a single (or a group) of element(s) (but leave all other callbacks)

| Parameter | Type | Default | Description |
|:----------|:-----|:--------|:------------|
|`elementOrElements`|Array\<DomElem\> \|\| DomElem|**REQUIRED**|The element(s) to observe|
|`event`|String|**REQUIRED**|The event a callback is attached to. Must be one of [`'entered'`, `'entering'`, `'leaving'`, `'left'`]|

And that pretty much it...

Enjoy :)