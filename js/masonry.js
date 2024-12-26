var msnry = new Masonry('.row', {
    itemSelector: '.col',
    percentPosition: true
});
setTimeout(function () {
    msnry.layout();
}, 100);

setTimeout(function () {
    msnry.layout();
}, 300);

setTimeout(function () {
    msnry.layout();
}, 1000);

setTimeout(function () {
    msnry.layout();
}, 5000);