let searchTimeout = null;
const searchData = {};

function buildQuoteHTML($quote) {
    return `<div class="row mx-auto align-items-center">
        <div class="col-12 col-sm-2 col-lg-2 offset-lg-1 text-center">
            <img src=${$quote.children('pic_url').text()} class="d-block align-self-center" alt="Carousel Pic"/>
        </div>
        <div class="col-12 col-sm-7 offset-sm-2 col-lg-9 offset-lg-0">
            <div class="quote-text">
                <p class="text-white">
                    « ${$quote.children('text').text()} »
                </p>
                <h4 class="text-white font-weight-bold">${$quote.children('name').text()}</h4>
                <span class="text-white">${$quote.children('title').text()}</span>
            </div>
        </div>
    </div>`;
}

function buildVideoHTML($video) {
    const starCount = $video.attr('star')
    return `<div class="card align-items-center">
        <img src="${$video.find('thumb_url').text()}" class="card-img-top" alt="Video thumbnail"/>
        <div class="card-img-overlay text-center">
            <img src="images/play.png" alt="Play" width="64px" class="align-self-center play-overlay"/>
        </div>
        <div class="card-body">
            <h5 class="card-title font-weight-bold">${$video.find('title').text()}</h5>
            <p class="card-text text-muted">${$video.find('sub-title').text()}</p>
            <div class="creator d-flex align-items-center">
                <img src="${$video.find('author_pic_url').text()}" alt="Creator of Video" width="30px" class="rounded-circle"/>
                <h6 class="pl-3 m-0 main-color">${$video.find('author').text()}</h6>
            </div>
            <div class="info pt-3 d-flex justify-content-between">
                <div class="rating">
                    ${'<img src="images/star_on.png" alt="star on" width="15px" />\n'.repeat(starCount)}
                    ${'<img src="images/star_off.png" alt="star off" width="15px" />\n'.repeat(5 - starCount)}
                </div>
                <span class="main-color">${$video.find('duration').text()}</span>
            </div>
        </div>
    </div>`;
}

function carouselSlick(carouselSelector) {
    $(carouselSelector).slick({
        autoplay: true,
        arrows: true,
        prevArrow: '<a class="carousel-control-prev arrow-left" role="button"><img src="images/arrow_black_left.png" alt="Previous" aria-hidden="true"/><span class="sr-only">Previous</span></a>',
        nextArrow: '<a class="carousel-control-next arrow-right" role="button"><img src="images/arrow_black_right.png" alt="Next" aria-hidden="true"/><span class="sr-only">Next</span></a>',
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

function fetchCarouselData(carouselSelector, fetchURL, entryTemplate, slick = false) {
    const $carousel = $(carouselSelector);
    if (!$carousel.length)
        return;

    const $carouselInner = slick ? $carousel : $carousel.find('.carousel-inner');

    $carousel.after($('<div class="loader">'));
    $carousel.hide();

    $.ajax({
        url: fetchURL,
        dataType: 'xml',
        success: function(data) {
            const itemClass = slick ? 'carousel-slick-item': 'carousel-item';
            for (const entry of $(data).children().children()) {
                const $entryHtml = $(entryTemplate($(entry)));

                $carouselInner.append($('<div>').addClass(itemClass).append($entryHtml));
            }

            if (!slick)
                $carouselInner.children().first().addClass('active');

            $carousel.siblings('.loader').remove();
            $carousel.show();

            if (slick)
                carouselSlick(carouselSelector);
        }
    });
}

function fetchSearchResult(initialSearch = false) {
    const $resultContainer = $('section.results .row');
    const $videoCount = $('section.results .section-title span');

    $resultContainer.empty();
    $resultContainer.after($('<div class="loader">'));
    $videoCount.hide();

    $.ajax({
        url: 'https://smileschool-api.hbtn.info/xml/courses',
        data: searchData,
        dataType: 'xml',
        success: function(results) {
            const $results = $(results).children('result');
            if (initialSearch) {
                fillDropdown('#menu-link-search-topic span', $results.children('topic').text(), '#input-search-topic', $results.children('topics'));
                fillDropdown('#menu-link-search-sort span', $results.children('sort').text(), '#input-search-sort', $results.children('sorts'));
            }
            $('#input-search-keywords').val($results.children('q').text());

            const $courses = $results.children('courses').children('course');
            for (const course of $courses) {
                const $courseElem = $('<div class="col-12 col-sm-4 col-lg-3 d-flex justify-content-center">').append(buildVideoHTML($(course)));
                $resultContainer.append($courseElem);
            }

            $resultContainer.siblings('.loader').remove();
            $videoCount.text(`${$courses.length} video${$courses.length > 1 ? 's': ''}`);
            $videoCount.show();
        }
    });
}

function fillDropdown(currentValueSelector, currentValue, optionListSelector, optionList) {
    $(currentValueSelector).text(fancyDropdownValue(currentValue));

    for (const option of optionList.children()) {
        const value = $(option).text();
        $(optionListSelector).append($(`<a class="dropdown-item" href="#" data-value=${value}>${fancyDropdownValue(value)}</a>`));
    }
}

function fancyDropdownValue(value) {
    const words = value.split('_');
    
    for (const index in words) {
        const orig = words[index];
        if (orig.length == 0)
            continue;

        const firstLetter = orig[0].toUpperCase();
        words[index] = firstLetter + orig.substring(1);
    }

    return words.join(' ');
}

function delayedSearch() {
    if (searchTimeout)
        clearTimeout(searchTimeout);

    searchData.q = $('#input-search-keywords').val();
    searchTimeout = setTimeout(fetchSearchResult, 500);
}

function addSearchEvents() {
    $('#input-search-keywords').on('input', delayedSearch);
    $(document).on('click', '#input-search-topic a', function() {
        const value = $(this).text();
        searchData.topic = $(this).data('value');
        $('#menu-link-search-topic span').text(value);
        fetchSearchResult();
    });
    $(document).on('click', '#input-search-sort a', function() {
        const value = $(this).text();
        searchData.sort = $(this).data('value');
        $('#menu-link-search-sort span').text(value);
        fetchSearchResult();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCarouselData('#carousel-quotes', 'https://smileschool-api.hbtn.info/xml/quotes', buildQuoteHTML);
    fetchCarouselData('#carousel-tutorials', 'https://smileschool-api.hbtn.info/xml/popular-tutorials', buildVideoHTML, true);
    fetchCarouselData('#carousel-videos', 'https://smileschool-api.hbtn.info/xml/latest-videos', buildVideoHTML, true);
    fetchSearchResult(true);
    addSearchEvents();
});