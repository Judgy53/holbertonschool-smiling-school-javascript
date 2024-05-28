document.addEventListener('DOMContentLoaded', () => {
    fetchQuotes();
});

function fetchQuotes() {
    const $quotesCarousel = $('section.quotes .carousel');
    if (!$quotesCarousel)
        return;

    const $carouselInner = $quotesCarousel.find('.carousel-inner');
    const $loader = $('<div>').addClass("loader");

    $loader.insertAfter($quotesCarousel);
    $quotesCarousel.hide();

    $.get("https://smileschool-api.hbtn.info/quotes", function(data) {
        for (const quote of data) {
            const $item = $(`
            <div class="carousel-item">
                <div class="row mx-auto align-items-center">
                    <div class="col-12 col-sm-2 col-lg-2 offset-lg-1 text-center">
                        <img src=${quote.pic_url} class="d-block align-self-center" alt="Carousel Pic"/>
                    </div>
                    <div class="col-12 col-sm-7 offset-sm-2 col-lg-9 offset-lg-0">
                        <div class="quote-text">
                            <p class="text-white">
                                « ${quote.text} »
                            </p>
                            <h4 class="text-white font-weight-bold">${quote.name}</h4>
                            <span class="text-white">${quote.title}</span>
                        </div>
                    </div>
                </div>
            </div>`);
            $carouselInner.append($item);
        }
        $carouselInner.children().first().addClass('active');

        $loader.remove();
        $quotesCarousel.show();
    });
}