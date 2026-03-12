var msnry = new Masonry('.row', {
    itemSelector: '.col',
    percentPosition: true
});

imagesLoaded('.row', function() {
    msnry.layout();
});
