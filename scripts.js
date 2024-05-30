function fetchQuotes() {
    const entryTemplate = entry => `
    <div class="row mx-auto align-items-center">
        <div class="col-12 col-sm-2 col-lg-2 offset-lg-1 text-center">
            <img src=${entry.pic_url} class="d-block align-self-center" alt="Carousel Pic"/>
        </div>
        <div class="col-12 col-sm-7 offset-sm-2 col-lg-9 offset-lg-0">
            <div class="quote-text">
                <p class="text-white">
                    « ${entry.text} »
                </p>
                <h4 class="text-white font-weight-bold">${entry.name}</h4>
                <span class="text-white">${entry.title}</span>
            </div>
        </div>
    </div>`;

    fetchCarouselData('section.quotes .carousel', 'https://smileschool-api.hbtn.info/quotes', entryTemplate);
}

function fetchPopular() {
    const entryTemplate = entry => `
    <div class="card align-items-center">
        <img src="${entry.thumb_url}" class="card-img-top" alt="Video thumbnail"/>
        <div class="card-img-overlay text-center">
            <img src="images/play.png" alt="Play" width="64px" class="align-self-center play-overlay"/>
        </div>
        <div class="card-body">
            <h5 class="card-title font-weight-bold">${entry.title}</h5>
            <p class="card-text text-muted">${entry['sub-title']}</p>
            <div class="creator d-flex align-items-center">
                <img src="${entry.author_pic_url}" alt="Creator of Video" width="30px" class="rounded-circle"/>
                <h6 class="pl-3 m-0 main-color">${entry.author}</h6>
            </div>
            <div class="info pt-3 d-flex justify-content-between">
                <div class="rating">
                    ${'<img src="images/star_on.png" alt="star on" width="15px" />\n'.repeat(entry.star)}
                    ${'<img src="images/star_off.png" alt="star off" width="15px" />\n'.repeat(5 - entry.star)}
                </div>
                <span class="main-color">${entry.duration}</span>
            </div>
        </div>
    </div>`;
    
    fetchCarouselData('section.popular .carousel-slick', 'https://smileschool-api.hbtn.info/popular-tutorials', entryTemplate, true);
}

function fetchCarouselData(carouselSelector, fetchURL, entryTemplate, slick = false) {
    const $carousel = $(carouselSelector);
    if (!$carousel.length)
        return;

    const $carouselInner = slick ? $carousel : $carousel.find('.carousel-inner');

    $carousel.after($('<div class="loader">'));
    $carousel.hide();

    $.get(fetchURL, function(data) {
        const itemClass = slick ? 'carousel-slick-item': 'carousel-item';
        for (const entry of data) {
            const $entryHtml = $(entryTemplate(entry));

            $carouselInner.append($('<div>').addClass(itemClass).append($entryHtml));
        }

        if (!slick)
            $carouselInner.children().first().addClass('active');

        $carousel.siblings('.loader').remove();
        $carousel.show();

        if (slick)
            carouselSlick(carouselSelector);
    });
}

function carouselSlick(carouselSelector) {
    const $carousel = $(carouselSelector);
    if (!$carousel.length)
        return;

    $carousel.slick({
        autoplay: true,
        arrows: true,
        prevArrow: '<a class="carousel-control-prev arrow-left" href="#carousel_tutorials" role="button"><img src="images/arrow_black_left.png" alt="Tutorials Previous" aria-hidden="true"/><span class="sr-only">Previous</span></a>',
        nextArrow: '<a class="carousel-control-next arrow-right" href="#carousel_tutorials" role="button"><img src="images/arrow_black_right.png" alt="Tutorials Next" aria-hidden="true"/><span class="sr-only">Next</span></a>',
        slidesToShow: 4,
        responsive: [
            {
                breakpoint: 1000,
                settings: {
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchQuotes();
    fetchPopular();
});