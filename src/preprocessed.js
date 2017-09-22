/*
 * Using fathom to extract a product from its product page,
 * where a 'product' is defined by the bundle of features that
 * makes it identifiable.
 *
 * Features: Title, Image, Price
 *
 */

const {dom, out, rule, ruleset, score, type} = require('fathom-web');
const tuningRoutines = {
                        'title' : {'routine': tunedTitleFnodes, 'coeffs': []},
                        'price' : {'routine': tunedPriceFnodes, 'coeffs':  [ 4.4, 3, 100, 2, 5, 2.6, 160, 2.6, 0.4, 0.2, 0.5, 0.2, 0.5, 4.4, 1.6, 0.8, 0.2, 0.05, 2.6, 0.65, 440]},
                        'image' : {'routine': tunedImageFnodes, 'coeffs': [1.9, 3.0, 420.0, 500.0, 0.05, 800.0, 1300.0, 0.7, 0.2, 0.5, 0.1, 0.1, 1.3]}
                        };
const VIEWPORT_WIDTH = window.innerWidth;
const VIEWPORT_HEIGHT = window.innerHeight;

/*
 * Remove dollar sign, strip whitespace, strip words (anything not numeric or a price symbol), and remove trailing zeros
 */
function formatPrice(priceString){
  priceString = priceString.replace('$', '').replace(/([\s]|[^0-9$.-])/g, '');
  return parseFloat(priceString.substr(priceString.indexOf('$') + 1));
}

/*
 * Remove the query params from a url by removing the '?' and the text that comes after it
 */
function withoutQueryParams(url){
  var index = url.indexOf('?');
  if (index !== -1){
    return url.substr(0,index);
  }
  return url;
}

/*
 * Ruleset for product images
 */
function tunedImageFnodes(coeffImgSize = 1.9, coeffImgHasSrc = 3.0, coeffImgTitle = 420.0,
  coeffItemprop = 500.0, coeffBadKeywords = 0.05, coeffGoodKeywords = 800.0, coeffClassKeywords = 1300.0,
  coeffTitleWords = 0.7, coeffAboveTheFold = 0.2, coeffLeftOfPage = 0.5, coeffSVGs = 0.1, coeffDataURLs = 0.1, titleWordsBase = 1.3) {
    let title = '';

    function imageSize(fnode) {
      const css = fnode.element.getBoundingClientRect();
      if ((css.right - css.left) * (css.bottom - css.top) === 0){
        return 1;
      }
      return (css.right - css.left) * (css.bottom - css.top) * coeffImgSize;
    }

    function imageHasSrc(fnode) {
      return (fnode.element.hasAttribute('src') && fnode.element.getAttribute('src') !== '') * coeffImgHasSrc;
    }

    function imageTitle(fnode) {
      const attrs = ['title', 'alt'];
      for (let i = 0; i < attrs.length; i++){
        if (fnode.element.getAttribute(attrs[i]) &&
            (fnode.element.getAttribute(attrs[i]).includes(title) || title.includes(fnode.element.getAttribute(attrs[i])))){
              return coeffImgTitle;
            }
      }
      return 1;
    }

    function itemprop(fnode){
      if (fnode.element.hasAttribute('itemprop') && fnode.element.getAttribute('itemprop').match(/(image|main|product|hero|feature)/i)){
        return coeffItemprop;
      }
    }

    function keywords(fnode) {
      if (fnode.element.hasAttribute('src') && fnode.element.src.match(/(thumb|logo|icon)/i)){
        return coeffBadKeywords;
      }

      const attrs = ['src', 'id', 'alt', 'title'];
      for (let i = 0; i < attrs.length; i++){
        if (fnode.element.hasAttribute(attrs[i]) && fnode.element.getAttribute(attrs[i]).match(/(main|product|hero|feature|primary)/i)){
          return coeffGoodKeywords;
        }
      }

      for (let i = 0; i < fnode.element.classList.length; i++){
        if (fnode.element.classList[i].match(/(hero|main|product|primary|feature)/i)){
          return coeffClassKeywords;
        }
      }
      return 1;
    }

    function wordsInTitle(fnode){
      const titleWords = title.replace('|', '').split(' ');
      const attrs = ['src', 'title', 'alt'];
      let start = 1;
      for (let j = 0; j < attrs.length; j++){
        for (let i = 0; i < titleWords.length; i++){
            if (titleWords[i].match(/^[a-z0-9]+$/i)){
              const regex = new RegExp(titleWords[i], "i");
              if (fnode.element.hasAttribute(attrs[j]) && fnode.element.getAttribute(attrs[j]).match(regex)){
                start+= fnode.element.getAttribute(attrs[j]).match(regex).length;
              }
          }
        }
      }
      //exaggerating the differences a little
      return Math.pow(titleWordsBase, start) * coeffTitleWords;
    }

    function aboveTheFold(fnode){
      const css = fnode.element.getBoundingClientRect();
      if (css.top < VIEWPORT_HEIGHT){
        return 1;
      }
      return coeffAboveTheFold;
    }

    function leftOfPage(fnode){
      const css = fnode.element.getBoundingClientRect();
      if (css.left < VIEWPORT_WIDTH/2){
        return 1;
      }
      return coeffLeftOfPage;
    }

    function notSVGs(fnode){
      if (fnode.element.hasAttribute('src') && fnode.element.getAttribute('src').includes('.svg')){
        return 0;
      }
      return coeffSVGs;
    }

    function notDataURLs(fnode){
      if (fnode.element.hasAttribute('src') && fnode.element.getAttribute('src').includes('data:')){
        return 0;
      }
      return coeffDataURLs;
    }

    const rules = ruleset(
      //get all images
      rule(dom('img'), type('images')),

      //better score for larger images
      rule(type('images'), score(imageSize)),

      //make sure image has src
      rule(type('images'), score(imageHasSrc)),

      //image title matches page title
      rule(type('images'), score(imageTitle)),

      //punish/bonus for good/bad css in class, id, url, etc.
      rule(type('images'), score(keywords)),

      //check if itemprop attribute has certain keywords
      rule(type('images'), score(itemprop)),

      //words in the title are in the src/image title/alt
      rule(type('images'), score(wordsInTitle)),

      //static bonus for images visible without scrolling
      rule(type('images'), score(aboveTheFold)),

      //static bonus for images to the left of the page
      rule(type('images'), score(leftOfPage)),

      //eliminate images of type svg
      rule(type('images'), score(notSVGs)),

      //image src likely will not be a data-url
      rule(type('images'), score(notDataURLs)),

      //return image with max score
      rule(type('images').max(), out('product-image'))

    );

    function tuningRoutine(doc) {
        title = tunedTitleFnodes()(doc).map(fnode => fnode.element.innerHTML)[0];
        return rules.against(doc).get('product-image');
    }

    return tuningRoutine;
}

/*
 * Ruleset for product titles
 */
function tunedTitleFnodes() {

    const rules = ruleset(
      //get all title tags in the inserted fixture
      rule(dom('title'), type('titleish')),

      //return image with max score
      rule(type('titleish').max(), out('product-title'))

    );

    function tuningRoutine(doc) {
        return rules.against(doc).get('product-title');
    }

    return tuningRoutine;
}

/*
 * Ruleset for product prices
 */
function tunedPriceFnodes(coeffDollarSign = 4.4, coeffNearDollarSign = 3, coeffHasNumbers = 100,
  coeffSpanBonus = 2, coeffSemanticTags = 5, coeffCurrentPrice = 2.6, coeffItemprop = 160, coeffKeywords = 2.6,
  coeffStrike = 0.4, coeffNotSavings = 0.2, coeffAboveFold = 0.5, coeffCenterRight = 0.2, coeffMiddleHeight = 0.5,
  coeffBolded = 4.4, coeffNumNumbers4 = 1.6, coeffNumNumbers8 = 0.8, coeffNumNumbers = 0.2, coeffNumDollarSigns = 0.05,
  coeffPriceFormat = 2.6, coeffNumDots = 0.65, coeffMetaTag = 440) {

    function hasDollarSign(fnode){
      if (fnode.element.textContent.includes('$')){
        return coeffDollarSign;
      }
      return 1;
    }

    function nearDollarSign(fnode){
      if (fnode.element.previousSibling && fnode.element.previousSibling.textContent.includes('$')){
        return coeffNearDollarSign;
      }
      return 1;
    }

    function hasNumbers(fnode){
      const regex = new RegExp(".*[0-9].*");
      if (fnode.element.textContent.match(regex)){
        return coeffHasNumbers;
      }
      return 1;
    }

    function spanBonus(fnode){
      if (fnode.element.tagName === 'SPAN'){
        return coeffSpanBonus;
      }
      return 1;
    }

    function semanticTags(fnode){
      if (fnode.element.getElementsByTagName('SUP').length > 0){
        return coeffSemanticTags;
      }
      return 1;
    }

    function priceIsCurrent(fnode){
      if (fnode.element.id.match(/(current|now)/i)){
        return coeffCurrentPrice;
      }

      for (let i = 0; i < fnode.element.classList.length; i++){
        if (fnode.element.classList[i].match(/(current|now)/i)){
          return coeffCurrentPrice;
        }
      }
      return 1;
    }

    function itemprop(fnode){
      if (fnode.element.hasAttribute('itemprop') && fnode.element.getAttribute('itemprop').match(/price/i)){
        return coeffItemprop;
      }
      return 1;
    }

    function tagHasGoodCss(fnode){
      const regex = new RegExp(/(price|sale|deal|total)/, 'i');
      if (fnode.element.id.match(regex)){
        return coeffKeywords;
      }

      for (let i = 0; i < fnode.element.classList.length; i++){
        if (fnode.element.classList[i].match(regex)){
          return coeffKeywords;
        }
      }
      return 1;
    }

    function notSrikedOut(fnode){
      const css = window.getComputedStyle(fnode.element).getPropertyValue('text-decoration');
      if (css === 'line-through'){
        return coeffStrike;
      }
      return 1;
    }

    function notSavingsAmount(fnode){
      const range_regex = "(.*[0-9].*)-(.*[0-9].*)";
      if (fnode.element.textContent.includes('-') && !fnode.element.textContent.match(range_regex)){
        return coeffNotSavings;
      }
      return 1;
    }

    function aboveTheFold(fnode){
      const css = fnode.element.getBoundingClientRect();
      if (css.top < VIEWPORT_HEIGHT){
        return 1;
      }
      return coeffAboveFold;
    }

    function centerRightOfPage(fnode){
      const css = fnode.element.getBoundingClientRect();
      //somewhat arbitrary choices, could put it through the optimizer later
      if (css.left > VIEWPORT_WIDTH/3 && css.left < VIEWPORT_WIDTH * 3/4){
        return 1;
      }
      return coeffCenterRight;
    }

    function middleHeight(fnode){
      const css = fnode.element.getBoundingClientRect();
      //somewhat arbitrary choices, could put it through the optimizer later
      if (css.top > VIEWPORT_HEIGHT/6 && css.top < VIEWPORT_HEIGHT * 3/4){
        return 1;
      }
      return coeffMiddleHeight;
    }

    function bolded(fnode){
      if (fnode.element.id.match(/(bold)/i)){
        return coeffBolded;
      }

      for (let i = 0; i < fnode.element.classList.length; i++){
        if (fnode.element.classList[i].match(/(bold)/i)){
          return coeffBolded;
        }
      }
      return 1;
    }

    function numberOfNumbers(fnode){
      //one price often ~4 or <= 4 numbers
      if (fnode.element.textContent.match(/[0-9]/g) && fnode.element.textContent.match(/[0-9]/g).length <= 4){
        return coeffNumNumbers4;
      }
      //two prices in a range often <= 8 numbers
      if (fnode.element.textContent.match(/[0-9]/g) && fnode.element.textContent.match(/[0-9]/g).length <= 8){
        return coeffNumNumbers8;
      }
      return coeffNumNumbers;
    }

    function numberOfDollarSigns(fnode){
      if (fnode.element.textContent.match(/[\$]/g) && fnode.element.textContent.match(/[\$]/g).length > 2){
        return coeffNumDollarSigns;
      }
      return 1;
    }

    function priceFormat(fnode){
      if (fnode.element.textContent.match(/(.*[0-9].*)-(.*[0-9].*)/) ||
         fnode.element.textContent.match(/[\$][\\d]+[\\.][0-9][0-9]/) ||
         fnode.element.textContent.match(/\$[\\d]+/)){
           return coeffPriceFormat;
         }
      return 1;
    }

    function numberOfDots(fnode){
      if (fnode.element.textContent.match(/\./g) && fnode.element.textContent.match(/\./g).length >= 2 && !fnode.element.textContent.includes('-')){
        return coeffNumDots;
      }
      return 1;
    }

    function metaTags(fnode){
      if (fnode.element.tagName === 'META' && fnode.element.hasAttribute('itemprop') && fnode.element.getAttribute('itemprop').match(/price/i) &&
         !fnode.element.getAttribute('itemprop').match(/currency/i)){
        return coeffMetaTag;
      }
      return 1;
    }

    const rules = ruleset(
      //get all elements that could contain the price
      rule(dom('span, div, li, strong, p, em, h1, h2, h3, h4, h5, h6, meta'), type('priceish')),

      //check if text has dollar sign
      rule(type('priceish'), score(hasDollarSign)),

      //check if previous sibling has a dollar sign
      rule(type('priceish'), score(nearDollarSign)),

      //text has numbers
      rule(type('priceish'), score(hasNumbers)),

      //bonus for span tags, common for prices
      rule(type('priceish'), score(spanBonus)),

      //check for semantic tags like sup and strong
      rule(type('priceish'), score(semanticTags)),

      //check for keywords indicating the price is the current price
      rule(type('priceish'), score(priceIsCurrent)),

      //check if the itemprop attibute has price keywords
      rule(type('priceish'), score(itemprop)),

      //other price keywords in id, class, etc
      rule(type('priceish'), score(tagHasGoodCss)),

      //price is not striked out
      rule(type('priceish'), score(notSrikedOut)),

      //check for a minus sign that is not part of a price range
      rule(type('priceish'), score(notSavingsAmount)),

      //visible on the page
      rule(type('priceish'), score(aboveTheFold)),

      //static bonus if within some x-axis range
      rule(type('priceish'), score(centerRightOfPage)),

      //static bonus if within some y-axis range
      rule(type('priceish'), score(middleHeight)),

      //class/style keywords indicating its bolded
      rule(type('priceish'), score(bolded)),

      //number of numbers
      rule(type('priceish'), score(numberOfNumbers)),

      //number of dollar signs
      rule(type('priceish'), score(numberOfDollarSigns)),

      //number of decimal points
      rule(type('priceish'), score(numberOfDots)),

      //if in one of three formats: price range, price with decimal (2 numbers after decimal), price without decimal
      rule(type('priceish'), score(priceFormat)),

      //check meta tags with itemprop = price
      rule(type('priceish'), score(metaTags)),

      //return image with max score
      rule(type('priceish').max(), out('product-price'))

    );

    function tuningRoutine(doc) {
        return rules.against(doc).get('product-price');
    }

    return tuningRoutine;
}


/*
 * Run the ruleset for a feature against the current window document
 * @param {string} feature title/image/price
 * @param {object} array of tuning coeffs if any
 */
function runRuleset(feature, coeffs = []) {
    const tuningRoutine = tuningRoutines[feature].routine;
    let gotText;
    if (feature === 'image') {
      gotText = withoutQueryParams(tuningRoutine(...coeffs)(window.document).map(fnode => fnode.element.src)[0]);

    } else if (feature === 'title') {
      //compare innerHTML text of titles
      gotText = tuningRoutine(...coeffs)(window.document).map(fnode => fnode.element.innerHTML)[0];

    } else if (feature === 'price') {
      //strip whitespace, dollar sign, words, and trailing zeros when comparing price
      gotText = tuningRoutine(...coeffs)(window.document).map(fnode => fnode.element)[0];
      gotText = formatPrice((gotText.tagName !== 'META')? gotText.textContent : gotText.getAttribute('content'));

    }
    return gotText;
}

console.log(runRuleset('title', tuningRoutines['title'].coeffs));
console.log(runRuleset('image', tuningRoutines['image'].coeffs));
console.log(runRuleset('price', tuningRoutines['price'].coeffs));


// Inform the background page that
// this tab should have a page-action
browser.runtime.sendMessage({
  from:    'content',
  subject: 'showPageAction'
});

// Listen for messages from the popup
browser.runtime.onMessage.addListener(function (msg, sender, response) {
  // First, validate the message's structure
  if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
    var domInfo = {
      title:  runRuleset('title', tuningRoutines['title'].coeffs),
      image:  runRuleset('image', tuningRoutines['image'].coeffs),
      price:  runRuleset('price', tuningRoutines['price'].coeffs)
    };

    // Directly respond to the sender (popup),
    // through the specified callback */
    response(domInfo);
  }
});
