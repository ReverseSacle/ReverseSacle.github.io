var CONFIG = {"version":"0.3.4","hostname":"https://www.reversesacle.com","root":"/","statics":"/","inner_proxy":"/","plugin_proxy":"/","favicon":{"normal":"images/favicon.ico","hidden":"images/failure.ico"},"darkmode":false,"auto_scroll":false,"js":{"waline":"npm/@waline/client@3/dist/waline.umd.min.js","chart":"npm/frappe-charts@1.5.0/dist/frappe-charts.min.iife.min.js","copy_tex":"npm/katex@0.12.0/dist/contrib/copy-tex.min.js","fancybox":"combine/npm/jquery@3.5.1/dist/jquery.min.js,npm/@fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js,npm/justifiedGallery@3.8.1/dist/js/jquery.justifiedGallery.min.js"},"css":{"waline_crop":"css/comment.css","waline":"combine/npm/@waline/client@3.6.0/dist/waline.min.css,/npm/@waline/client@3.6.0/dist/waline-meta.css","katex":"npm/katex@0.12.0/dist/katex.min.css","fancybox":"combine/npm/@fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.css,npm/justifiedGallery@3.8.1/dist/css/justifiedGallery.min.css"},"loader":{"start":true,"switch":false},"search":{"appID":"YNRLAAETIC","apiKey":"0db77b6334e19c600b99863a6037a07e","indexName":"blog_index","hits":{"per_page":10}},"waline":{"serverURL":"","comment":true,"pageview":true,"lang":"zh-CN","dark":"auto","commentSorting":"latest","login":"disable","wordLimit":0,"pageSize":8,"imageUploader":false,"highlighter":false,"texRenderer":false,"search":false,"noCopyright":true,"recaptchaV3Key":false,"turnstileKey":false,"reaction":false,"meta":["nick","mail","link"],"requiredMeta":["nick","mail"],"locale":{"placeholder":"1.请遵守评论礼仪o(*￣▽￣*)o \n2.可前往Gravatar自行注册邮箱,并添加个性头像,有七天缓冲时间"},"emoji":[]},"quicklink":{"timeout":3000,"priority":true}};const getRndInteger = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getDocHeight = function() {
  return $('main > .inner').offsetHeight;
};

const getScript = function(url, callback, condition) {
  if (condition) { callback(); } 
  else 
  {
    var script = document.createElement('script');
    script.onload = (script.onreadystatechange = function(_, isAbort){
      if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) 
      {
        script.onload = script.onreadystatechange = null;
        script = undefined;
        if (!isAbort && callback){ setTimeout(callback, 0); }
      }
    });
    script.src = url;
    document.head.appendChild(script);
  }
};

const assetUrl = function(asset, type) {
  const str = CONFIG[asset][type];

  if(str.startsWith('http')){ return str; }
  
  if(str.startsWith('npm') || str.startsWith('gh') || str.startsWith('combine'))
  {
    const proxy = CONFIG.plugin_proxy;
    if("/" != proxy) { return proxy + '/' + str; }
    else { return "https://cdn.jsdelivr.net/" + str; }
  }

  // statics + str
  return CONFIG.statics + str;
};

const vendorJs = function(type, callback, condition) {
  if(LOCAL[type]) {
    getScript(assetUrl("js", type), callback || function(){
      window[type] = true;
    }, condition || window[type]);
  }
};

//function(type, condition)
const vendorCss = function(type,_) {
  if(window['css'+type]){ return; }

  if(LOCAL[type]) {
    document.head.createChild('link', {
      rel: 'stylesheet',
      href: assetUrl("css", type)
    });

    window['css'+type] = true;
  }
};

const vendorCss_body = function(type) {
  var name = 'css-' + type;
  if(undefined != document.querySelector('body link' + '.' + name)){
    return;
  }
    
  var new_link = document.body.createChild('link', {
    rel: 'stylesheet',
    href: assetUrl("css", type)
  });
  new_link.setAttribute('class',name);
};

const pjaxScript = function(element) {
  const code = element.text || element.textContent || element.innerHTML || '';
  var parent = element.parentNode;

  parent.removeChild(element);
  var script = document.createElement('script');
  if (element.id) { script.id = element.id; }
  if (element.className) { script.className = element.className; }
  if (element.type) { script.type = element.type; }
  if (element.src) {
    script.src = element.src;
    // Force synchronous loading of peripheral JS.
    script.async = false;
  }
  if (element.dataset.pjax !== undefined) {
    script.dataset.pjax = '';
  }
  if (code !== '') {
    script.appendChild(document.createTextNode(code));
  }
  parent.appendChild(script);
};

const pageScroll = function(target, offset, complete) {
  const opt = {
    targets: typeof offset == 'number' ? target.parentNode : document.scrollingElement,
    duration: 500,
    easing: "easeInOutQuad",
    scrollTop: offset || (typeof target == 'number' ? target : (target ? target.top() + document.documentElement.scrollTop - siteNavHeight : 0)),
    complete: function() { complete && complete(); }
  };
  anime(opt);
};

const transition = function(target, type, complete) {
  var animation = {};
  var display = 'none';
  switch(type) {
    case 0:
      animation = {opacity: [1, 0]};
      break;
    case 1:
      animation = {opacity: [0, 1]};
      display = 'block';
      break;
    case 'bounceUpIn':
      animation = {
        //function(anim)
        begin: function(_) { target.display('block'); },
        translateY: [
          { value: -60, duration: 200 },
          { value: 10, duration: 200 },
          { value: -5, duration: 200 },
          { value: 0, duration: 200 }
        ],
        opacity: [0, 1]
      };
      display = 'block';
      break;
    case 'shrinkIn':
      animation = {
        //function(anim)
        begin: function(_) { target.display('block') },
        scale: [
          { value: 1.1, duration: 300 },
          { value: 1, duration: 200 }
        ],
        opacity: 1
      };
      display = 'block';
      break;
    case 'slideRightIn':
      animation = {
        //function(anim)
        begin: function(_) { target.display('block') },
        translateX: [100, 0],
        opacity: [0, 1]
      };
      display = 'block';
      break;
    case 'slideRightOut':
      animation = {
        translateX: [0, 100],
        opacity: [1, 0]
      };
      break;
    default:
      animation = type;
      display = type.display;
      break;
  }
  anime(Object.assign({
    targets: target,
    duration: 200,
    easing: 'linear'
  }, animation)).finished.then(function() {
      target.display(display);
      complete && complete();
  });
};

const store = {
  get: function(item) { return localStorage.getItem(item); },
  set: function(item, str) {
    localStorage.setItem(item, str);
    return str;
  },
  del: function(item) { localStorage.removeItem(item); }
};
const $ = function(selector, element) {
  element = element || document;
  if(selector.indexOf('#') === 0) {
    return element.getElementById(selector.replace('#', ''));
  }
  return element.querySelector(selector);
};

$.all = function(selector, element) {
  element = element || document;
  return element.querySelectorAll(selector);
};

$.each = function(selector, callback, element) {
  return $.all(selector, element).forEach(callback);
};


Object.assign(HTMLElement.prototype, {
  createChild: function(tag, obj, positon) {
    var child = document.createElement(tag);
    Object.assign(child, obj);
    switch(positon) {
      case 'after':{ this.insertAfter(child); break; }
      case 'replace':{ this.innerHTML = ""; }
      default:{ this.appendChild(child); }
    }
    return child;
  },
  wrap: function(obj) {
    var box = document.createElement('div');
    Object.assign(box, obj);
    this.parentNode.insertBefore(box, this);
    this.parentNode.removeChild(this);
    box.appendChild(this);
  },
  height: function(h) {
    if(h) {
      this.style.height = typeof h == 'number' ? h + 'rem' : h;
    }
    return this.getBoundingClientRect().height;
  },
  width: function(w) {
    if(w) { this.style.width = typeof w == 'number' ? w + 'rem' : w; }
    return this.getBoundingClientRect().width;
  },
  top: function() {
    return this.getBoundingClientRect().top;
  },
  left:function() {
    return this.getBoundingClientRect().left;
  },
  attr: function(type, value) {
    if(value === null) { return this.removeAttribute(type); }

    if(value) {
      this.setAttribute(type, value);
      return this;
    } else { return this.getAttribute(type); }
  },
  insertAfter: function(element) {
    var parent = this.parentNode;
    if(parent.lastChild == this){ parent.appendChild(element); }
    else{ parent.insertBefore(element, this.nextSibling); }
  },
  display: function(d) {
    if(d == null) { return this.style.display; } 
    else {
      this.style.display = d;
      return this;
    }
  },
  child: function(selector) {
    return $(selector, this);
  },
  find: function(selector) {
    return $.all(selector, this);
  },
  _class: function(type, className, display) {
    var classNames = className.indexOf(' ') ?  className.split(' ') : [className];
    var that = this;
    classNames.forEach(function(name) {
      if(type == 'toggle') { that.classList.toggle(name, display); }
      else { that.classList[type](name); }
    })
  },
  addClass: function(className) {
    this._class('add', className);
    return this;
  },
  removeClass: function(className) {
    this._class('remove', className);
    return this;
  },
  toggleClass: function(className, display) {
    this._class('toggle', className, display);
    return this;
  },
  hasClass: function(className) {
    return this.classList.contains(className);
  }
});
var statics = CONFIG.statics.indexOf('//') > 0 ? CONFIG.statics : CONFIG.root;
var proxy = CONFIG.inner_proxy.indexOf('//') > 0 ? CONFIG.inner_proxy : CONFIG.root;
var scrollAction = { x: 'undefined', y: 'undefined' };
var diffY = 0;
var originTitle, titleTime;

const BODY = document.body;
const HTML = document.documentElement;
const Container = $('#container');
const loadCat = $('#loading');
const siteNav = $('#nav');
const siteHeader = $('#header');
const menuToggle = siteNav.child('.toggle');
const quickBtn = $('#quick');
const sideBar = $('#sidebar');
const siteBrand = $('#brand');
var toolBtn = $('#tool'), backToTop, goToComment, showContents;
var siteSearch = $('#search');
var siteNavHeight, headerHightInner, headerHight;
var oWinHeight = window.innerHeight;
var oWinWidth = window.innerWidth;
var LOCAL_HASH = 0, LOCAL_URL = window.location.href;
var pjax;
const lazyload = lozad('img, [data-background-image]', {
    loaded: function(el) { el.addClass('lozaded'); }
});

const Loader = {
  timer: null,
  lock: false,
  show: function() {
    clearTimeout(this.timer);
    document.body.removeClass('loaded');
    loadCat.attr('style', 'display:block');
    Loader.lock = false;
  },
  hide: function(sec) {
    if(!CONFIG.loader.start){ sec = -1; }
    this.timer = setTimeout(this.vanish, sec||3000);
  },
  vanish: function() {
    if(Loader.lock){ return; }
    if(CONFIG.loader.start){ transition(loadCat, 0); }
    document.body.addClass('loaded');
    Loader.lock = true;
  }
};

const changeTheme = function(type) {
  var btn = $('.theme .ic');
  if(type == 'dark') {
    HTML.attr('data-theme', type);
    btn.removeClass('i-sun');
    btn.addClass('i-moon');
  } else {
    HTML.attr('data-theme', null);
    btn.removeClass('i-moon');
    btn.addClass('i-sun');
  }
};

const changeMetaTheme = function(color) {
  if(HTML.attr('data-theme') == 'dark'){ color = '#222'; }

  $('meta[name="theme-color"]').attr('content', color);
};

const themeColorListener = function() {
  const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
  const _Callback = function(mediaQueryList) {
    if(mediaQueryList.matches){ changeTheme('dark'); } 
    else { changeTheme(); }
  };

  try{ mediaQueryList.addEventListener('change', _Callback); }
  catch(err){ mediaQueryList.addListener(_Callback); }// Alread correct

  var t = store.get('theme');
  if(t) { changeTheme(t); } 
  else if(CONFIG.darkmode) { changeTheme('dark'); }

  $('.theme').addEventListener('click', function(event) {
    var btn = event.currentTarget.child('.ic');

    var neko = BODY.createChild('div', {
      id: 'neko',
      innerHTML: '<div class="planet"><div class="sun"></div><div class="moon"></div></div><div class="body"><div class="face"><section class="eyes left"><span class="pupil"></span></section><section class="eyes right"><span class="pupil"></span></section><span class="nose"></span></div></div>'
    });

    var hideNeko = function() {
      transition(neko, {
        delay: 2500,
        opacity: 0
      }, function() {
        BODY.removeChild(neko);
      });
    };

    if(btn.hasClass('i-sun')) {
      var c = function() {
        neko.addClass('dark');
        changeTheme('dark');
        store.set('theme', 'dark');
        hideNeko();
      };
    } else {
      neko.addClass('dark');
      var c = function() {
        neko.removeClass('dark');
        changeTheme();
        store.set('theme', 'light');
        hideNeko();
      };
    }
    transition(neko, 1, function() {
      setTimeout(c, 210);
    });
  });
};

const visibilityListener = function() {
  document.addEventListener('visibilitychange', function() {
    switch(document.visibilityState) {
      case 'hidden':{
        $('[rel="icon"]').attr('href', proxy + CONFIG.favicon.hidden);// statics + 
        document.title = LOCAL.favicon.hide;
        if(CONFIG.loader.switch){ Loader.show(); }
        clearTimeout(titleTime);
        break;
      }
      case 'visible':{
        $('[rel="icon"]').attr('href', proxy + CONFIG.favicon.normal);// statics +
        document.title = LOCAL.favicon.show;
        if(CONFIG.loader.switch){ Loader.hide(1000); }
        titleTime = setTimeout(function() {
          document.title = originTitle;
        }, 2000);
        break;
      }
    }
  });
};

const showtip = function(msg) {
  if(!msg){ return; }

  var tipbox = BODY.createChild('div', {
    innerHTML: msg,
    className: 'tip'
  });

  setTimeout(function() {
    tipbox.addClass('hide');
    setTimeout(function() {
      BODY.removeChild(tipbox);
    }, 300);
  }, 3000);
};

const resizeHandle = function(event) {
  siteNavHeight = siteNav.height();
  headerHightInner = siteHeader.height();
  headerHight = headerHightInner + $('#waves').height();

  if(oWinWidth != window.innerWidth){ sideBarToggleHandle(null, 1); }

  oWinHeight = window.innerHeight;
  oWinWidth = window.innerWidth;
  sideBar.child('.panels').height(oWinHeight + 'px');
};

const scrollHandle = function(event) {
  var winHeight = window.innerHeight;
  var docHeight = getDocHeight();
  var contentVisibilityHeight = docHeight > winHeight ? docHeight - winHeight : document.body.scrollHeight - winHeight;
//var SHOW = window.pageYOffset > headerHightInner;
//var startScroll = window.pageYOffset > 0;
  var SHOW = window.scrollY > headerHightInner;
  var startScroll = window.scrollY > 0;

  if (SHOW) { changeMetaTheme('#FFF'); } 
  else { changeMetaTheme('#222'); }

  siteNav.toggleClass('show', SHOW);
  toolBtn.toggleClass('affix', startScroll);
  siteBrand.toggleClass('affix', startScroll);
//sideBar.toggleClass('affix', window.pageYOffset > headerHight && document.body.offsetWidth > 991);
  sideBar.toggleClass('affix', window.scrollY > headerHight && document.body.offsetWidth > 991);

  if (typeof scrollAction.y == 'undefined') {
    //scrollAction.y = window.pageYOffset;
    scrollAction.y = window.scrollY;
    //scrollAction.x = Container.scrollLeft;
    //scrollAction.y = Container.scrollTop;
  }
  //var diffX = scrollAction.x - Container.scrollLeft;
  //diffY = scrollAction.y - window.pageYOffset;
  diffY = scrollAction.y - window.scrollY;
  //if (diffX < 0) {
  // Scroll right
  //} else if (diffX > 0) {
  // Scroll left
  //} else
  if (diffY < 0) {
    // Scroll down
    siteNav.removeClass('up');
    siteNav.toggleClass('down', SHOW);
  } else if (diffY > 0) {
    // Scroll up
    siteNav.removeClass('down');
    siteNav.toggleClass('up', SHOW);
  } else {
    // First scroll event
  }
  //scrollAction.x = Container.scrollLeft;
  //scrollAction.y = window.pageYOffset;
  scrollAction.y = window.scrollY;

  //var scrollPercent = Math.round(Math.min(100 * window.pageYOffset / contentVisibilityHeight, 100)) + '%';
  var scrollPercent = Math.round(Math.min(100 * window.scrollY / contentVisibilityHeight, 100)) + '%';
  backToTop.child('span').innerText = scrollPercent;
  $('.percent').width(scrollPercent);
};

const pagePosition = function() {
  if(CONFIG.auto_scroll){ store.set(LOCAL_URL, scrollAction.y); }
};

const positionInit = function(comment) {
  var anchor = window.location.hash;
  var target = null;
  if(LOCAL_HASH) {
    store.del(LOCAL_URL);
    return;
  }

  if(anchor){ target = $(decodeURI(anchor)); }
  else{ target = CONFIG.auto_scroll ? parseInt(store.get(LOCAL_URL)) : 0; }

  if(target) {
    pageScroll(target);
    LOCAL_HASH = 1;
  }

  if(comment && anchor && !LOCAL_HASH) {
    pageScroll(target);
    LOCAL_HASH = 1;
  }

};

const clipBoard = function(str, callback) {
  var ta = BODY.createChild('textarea', {
    style: {
      top: window.scrollY + 'px', // Prevent page scrolling
      position: 'absolute',
      opacity: '0'
    },
    readOnly: true,
    value: str
  });

  const selection = document.getSelection();
  const selected = selection.rangeCount > 0 ? selection.getRangeAt(0) : false;
  ta.select();
  ta.setSelectionRange(0, str.length);
  ta.readOnly = false;
  var result = document.execCommand('copy');
  
  callback && callback(result);
  ta.blur(); // For iOS
  if (selected) {
    selection.removeAllRanges();
    selection.addRange(selected);
  }
  BODY.removeChild(ta);
};

//function(event, force)
const sideBarToggleHandle = function(_, force) {
  if(sideBar.hasClass('on')) {
    sideBar.removeClass('on');
    menuToggle.removeClass('close');
    if(force) { sideBar.style = ''; } 
    else { transition(sideBar, 'slideRightOut'); }
  } else {
    if(force) { sideBar.style = ''; } 
    else {
      transition(sideBar, 'slideRightIn', function() {
          sideBar.addClass('on');
          menuToggle.addClass('close');
        });
    }
  }
};

const sideBarTab = function() {
  var sideBarInner = sideBar.child('.inner');
  var panels = sideBar.find('.panel');

  if(sideBar.child('.tab')) {
    sideBarInner.removeChild(sideBar.child('.tab'));
  }

  var list = document.createElement('ul'), active = 'active';
  list.className = 'tab';

  ['contents', 'related', 'overview'].forEach(function(item) {
    var element = sideBar.child('.panel.' + item);

    if(element.innerHTML.replace(/(^\s*)|(\s*$)/g, "").length < 1) {
      if(item == 'contents') { showContents.display("none"); }
      return;
    }

    if(item == 'contents') { showContents.display(""); }

    var tab = document.createElement('li');
    var span = document.createElement('span');
    var text = document.createTextNode(element.attr('data-title'));
    span.appendChild(text);
    tab.appendChild(span);
    tab.addClass(item + ' item');

    if(active) {
      element.addClass(active);
      tab.addClass(active);
    } else { element.removeClass('active'); }

    tab.addEventListener('click', function(event) {
      var target = event.currentTarget;
      if (target.hasClass('active')){ return; }

      sideBar.find('.tab .item').forEach(function(element) {
        element.removeClass('active');
      });

      sideBar.find('.panel').forEach(function(element) {
        element.removeClass('active');
      });

      sideBar.child('.panel.' + target.className.replace(' item', '')).addClass('active');
      target.addClass('active');
    });

    list.appendChild(tab);
    active = '';
  });

  if (list.childNodes.length > 1) {
    sideBarInner.insertBefore(list, sideBarInner.childNodes[0]);
    sideBar.child('.panels').style.paddingTop = '';
  } else {
    sideBar.child('.panels').style.paddingTop = '.625rem';
  }
};

const sidebarTOC = function() {
  var navItems = $.all('.contents li');

  if (navItems.length < 1) { return; }

  var sections = Array.prototype.slice.call(navItems) || [];
  var activeLock = null;

  sections = sections.map(function(element, index) {
    var link = element.child('a.toc-link');
    var anchor = $(decodeURI(link.attr('href')));
    if(!anchor){ return; }
    var alink = anchor.child('a.anchor');

    var anchorScroll = function(event) {
      event.preventDefault();
      var target = $(decodeURI(event.currentTarget.attr('href')));

      activeLock = index;
      pageScroll(target, null, function() {
          activateNavByIndex(index);
          activeLock = null;
      });
    };

    // TOC item animation navigate.
    link.addEventListener('click', anchorScroll);
    alink && alink.addEventListener('click', function(event) {
      anchorScroll(event);
      clipBoard(CONFIG.hostname + '/' + LOCAL.path + event.currentTarget.attr('href'));
    });
    return anchor;
  });

  var tocElement = sideBar.child('.contents.panel');

  //function(index, lock)
  var activateNavByIndex = function(index,_) {
    var target = navItems[index];

    if (!target){ return; }
    if (target.hasClass('current')) { return; }

    $.each('.toc .active', function(element) {
      element && element.removeClass('active current');
    });

    sections.forEach(function(element) {
      element && element.removeClass('active');
    });

    target.addClass('active current');
    sections[index] && sections[index].addClass('active');

    var parent = target.parentNode;

    while (!parent.matches('.contents')) {
      if (parent.matches('li')) {
        parent.addClass('active');
        var t = $(parent.child('a.toc-link').attr('href'))
        if(t) { t.addClass('active'); }
      }
      parent = parent.parentNode;
    }
    // Scrolling to center active TOC element if TOC content is taller then viewport.
    if(getComputedStyle(sideBar).display != 'none' && tocElement.hasClass('active')) {
      pageScroll(tocElement, target.offsetTop- (tocElement.offsetHeight / 4));
    }
  };

  var findIndex = function(entries) {
    var index = 0;
    var entry = entries[index];

    if (entry.boundingClientRect.top > 0) {
      index = sections.indexOf(entry.target);
      return index === 0 ? 0 : index - 1;
    }
    for (; index < entries.length; index++) {
      if (entries[index].boundingClientRect.top <= 0) {
        entry = entries[index];
      } else { return sections.indexOf(entry.target); }
    }
    return sections.indexOf(entry.target);
  };

  var createIntersectionObserver = function() {
    if (!window.IntersectionObserver){ return; }

    // function(entries, observe)
    var observer = new IntersectionObserver(function(entries,_) {
      var index = findIndex(entries) + (diffY < 0? 1 : 0);
      if(activeLock === null) { activateNavByIndex(index); }
    }, {
      rootMargin: '0px 0px -100% 0px',
      threshold: 0
    });

    sections.forEach(function(element) {
      element && observer.observe(element);
    });
  };

  createIntersectionObserver();
};

const backToTopHandle = function() {
  pageScroll(0);
};

const goToBottomHandle = function() {
  pageScroll(parseInt(Container.height()));
};

const goToCommentHandle = function() {
  pageScroll($('#comments'));
};

const menuActive = function() {
  $.each('.menu .item:not(.title)', function(element) {
    var target = element.child('a[href]');
    var parentItem = element.parentNode.parentNode;
    if (!target){ return; }
    
    var isSamePath = target.pathname === location.pathname || target.pathname === location.pathname.replace('index.html', '');
    var isSubPath = !CONFIG.root.startsWith(target.pathname) && location.pathname.startsWith(target.pathname);
    var active = target.hostname === location.hostname && (isSamePath || isSubPath);
    element.toggleClass('active', active);
    if(element.parentNode.child('.active') && parentItem.hasClass('dropdown')) {
      parentItem.removeClass('active').addClass('expand');
    } else { parentItem.removeClass('expand'); }
  });
};
const cardActive = function() {
  if(!$('.index.wrap')){ return; }

  if (!window.IntersectionObserver) {
    $.each('.index.wrap article.item, .index.wrap section.item', function(article) {
      if( article.hasClass("show") === false){
        article.addClass("show");
      }
    });
  } else {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(article) {
          if (article.target.hasClass("show")) {
            io.unobserve(article.target);
          } else {
            if (article.isIntersecting || article.intersectionRatio > 0) {
              article.target.addClass("show");
              io.unobserve(article.target);
            }
          }
        });
    }, {
        root: null,
        threshold: [0.3]
    });

    $.each('.index.wrap article.item, .index.wrap section.item', function(article) {
      io.observe(article);
    })

    $('.index.wrap .item:first-child').addClass("show");
  }

  //function(element, index)
  $.each('.cards .item', function(element,_) {
    ['mouseenter', 'touchstart'].forEach(function(item){
      element.addEventListener(item, function(event) {
        if($('.cards .item.active')) {
          $('.cards .item.active').removeClass('active');
        }
        element.addClass('active');
      });
    });
    ['mouseleave'].forEach(function(item){
      element.addEventListener(item, function(event) {
        element.removeClass('active');
      });
    });
  });
};

const registerExtURL = function() {
  $.each('span.exturl', function(element) {
      var link = document.createElement('a');
      // https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
      link.href = decodeURIComponent(atob(element.dataset.url).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      link.rel = 'noopener external nofollow noreferrer';
      link.target = '_blank';
      link.className = element.className;
      link.title = element.title || element.innerText;
      link.innerHTML = element.innerHTML;
      if(element.dataset.backgroundImage) {
        link.dataset.backgroundImage = element.dataset.backgroundImage;
      }
      element.parentNode.replaceChild(link, element);
  });
};

const postFancybox = function(p) {
  if($(p + ' .md img')) {
    vendorCss('fancybox');
    vendorJs('fancybox', function() {
      var q = jQuery.noConflict();

      $.each(p + ' p.gallery', function(element) {
        var box = document.createElement('div');
        box.className = 'gallery';
        box.attr('data-height', element.attr('data-height')||220);

        box.innerHTML = element.innerHTML.replace(/<br>/g, "");

        element.parentNode.insertBefore(box, element);
        element.remove();
      });

      $.each(p + ' .md img:not(.emoji):not(.vemoji)', function(element) {
        var $image = q(element);
        var info, captionClass = 'image-info';
        if(!$image.is('a img')) {
          var imageLink = $image.attr('data-src') || $image.attr('src');
          $image.data('safe-src', imageLink);
          var $imageWrapLink = $image.wrap('<a class="fancybox" href="'+imageLink+'" itemscope itemtype="http://schema.org/ImageObject" itemprop="url"></a>').parent('a');
          if (!$image.is('.gallery img')) {
            $imageWrapLink.attr('data-fancybox', 'default').attr('rel', 'default');
          } else { captionClass = 'jg-caption'; }
        }
        if(info = element.attr('title')) {
          $imageWrapLink.attr('data-caption', info);
          var para = document.createElement('span');
          var txt = document.createTextNode(info);
          para.appendChild(txt);
          para.addClass(captionClass);
          element.insertAfter(para);
        }
      });

      $.each(p + ' div.gallery', function (el, i) {
        q(el).justifiedGallery({rowHeight: q(el).data('height')||120, rel: 'gallery-' + i}).on('jg.complete', function() {
          //function(k, ele)
          q(this).find('a').each(function(_, ele) {
            ele.attr('data-fancybox', 'gallery-' + i);
          });
        });
      });

      q.fancybox.defaults.hash = false;
      q(p + ' .fancybox').fancybox({
        loop   : true,
        helpers: {
          overlay: {
            locked: false
          }
        }
      });
    }, window.jQuery);
  }
};

const postBeauty = function() {
  loadComments();

  if(!$('.md')){ return; }

  postFancybox('.post.block');

  $('.post.block').oncopy = function(event) {
    showtip(LOCAL.copyright);

    if(LOCAL.nocopy) {
      event.preventDefault();
      return;
    }

    var copyright = $('#copyright');
    if(window.getSelection().toString().length > 250 && copyright) {
      event.preventDefault();
      var author = "# " + copyright.child('.author').innerText;
      var link = "# " + copyright.child('.link').innerText;
      var license = "# " + copyright.child('.license').innerText;
      var htmlData = author + "<br>" + link + "<br>" + license + "<br><br>" + window.getSelection().toString().replace(/\r\n/g, "<br>");
      var textData = author + "\n" + link + "\n" + license + "\n\n" + window.getSelection().toString().replace(/\r\n/g, "\n");
      if (event.clipboardData) {
        event.clipboardData.setData("text/html", htmlData);
        event.clipboardData.setData("text/plain", textData);
      } else if (window.clipboardData) {
        return window.clipboardData.setData("text", textData);
      }
    }
  };

  $.each('li ruby', function(element) {
    var parent = element.parentNode;
    if(element.parentNode.tagName != 'LI') {
      parent = element.parentNode.parentNode;
    }
    parent.addClass('ruby');
  });

  $.each('ol[start]', function(element) {
    element.style.counterReset = "counter " + parseInt(element.attr('start') - 1);
  });

  $.each('.md table', function(element) {
    element.wrap({
      className: 'table-container'
    });
  });

  $.each('.highlight > .table-container', function(element) {
    element.className = 'code-container';
  });

  $.each('figure.highlight', function(element) {

    var code_container = element.child('.code-container');
    var caption = element.child('figcaption');

    element.insertAdjacentHTML('beforeend', '<div class="operation"><span class="breakline-btn"><i class="ic i-align-left"></i></span><span class="copy-btn"><i class="ic i-clipboard"></i></span><span class="fullscreen-btn"><i class="ic i-expand"></i></span></div>');

    var copyBtn = element.child('.copy-btn');
    if(LOCAL.nocopy) {
      copyBtn.remove();
    } else {
      copyBtn.addEventListener('click', function(event) {
        var target = event.currentTarget;
        var comma = '', code = '';
        code_container.find('pre').forEach(function(line) {
          code += comma + line.innerText;
          comma = '\n';
        });

        clipBoard(code, function(result) {
          target.child('.ic').className = result ? 'ic i-check' : 'ic i-times';
          target.blur();
          showtip(LOCAL.copyright);
        });
      });
      copyBtn.addEventListener('mouseleave', function(event) {
        setTimeout(function() {
          event.target.child('.ic').className = 'ic i-clipboard';
        }, 1000);
      });
    }

    var breakBtn = element.child('.breakline-btn');
    breakBtn.addEventListener('click', function(event) {
      var target = event.currentTarget;
      if (element.hasClass('breakline')) {
        element.removeClass('breakline');
        target.child('.ic').className = 'ic i-align-left';
      } else {
        element.addClass('breakline');
        target.child('.ic').className = 'ic i-align-justify';
      }
    });

    var fullscreenBtn = element.child('.fullscreen-btn');
    var removeFullscreen = function() {
      element.removeClass('fullscreen');
      element.scrollTop = 0;
      BODY.removeClass('fullscreen');
      fullscreenBtn.child('.ic').className = 'ic i-expand';
    };
    var fullscreenHandle = function(event) {
      var target = event.currentTarget;
      if (element.hasClass('fullscreen')) {
        removeFullscreen();
        hideCode && hideCode();
        pageScroll(element);
      } else {
        element.addClass('fullscreen');
        BODY.addClass('fullscreen');
        fullscreenBtn.child('.ic').className = 'ic i-compress';
        showCode && showCode();
      }
    };
    fullscreenBtn.addEventListener('click', fullscreenHandle);
    caption && caption.addEventListener('click', fullscreenHandle);

    if(code_container && code_container.find("tr").length > 15) {
      
      code_container.style.maxHeight = "300px";
      code_container.insertAdjacentHTML('beforeend', '<div class="show-btn"><i class="ic i-angle-down"></i></div>');
      var showBtn = code_container.child('.show-btn');

      var showCode = function() {
        code_container.style.maxHeight = "";
        showBtn.addClass('open');
      };

      var hideCode = function() {
        code_container.style.maxHeight = "300px";
        showBtn.removeClass('open');
      };

      showBtn.addEventListener('click', function(event) {
        if (showBtn.hasClass('open')) {
          removeFullscreen();
          hideCode();
          pageScroll(code_container);
        } else { showCode(); }
      });
    }
  });

  $.each('.reward button', function (element) {
    element.addEventListener('click', function (event) {
      event.preventDefault();
      var qr = $('#qr');
      if(qr.display() === 'inline-flex') {
        transition(qr, 0);
      } else {
        transition(qr, 1, function() {
          qr.display('inline-flex');
        }); // slideUpBigIn
      }
    });
  });

  //quiz
  $.each('.quiz > ul.options li', function(element) {
    element.addEventListener('click', function(event) {
      if (element.hasClass('correct')) {
        element.toggleClass('right');
        element.parentNode.parentNode.addClass('show');
      } else { element.toggleClass('wrong'); }
    });
  });

  $.each('.quiz > p', function(element) {
    element.addEventListener('click', function(event) {
      element.parentNode.toggleClass('show');
    });
  });

  $.each('.quiz > p:first-child', function(element) {
    var quiz = element.parentNode;
    var type = 'choice';
    if(quiz.hasClass('true') || quiz.hasClass('false'))
      type = 'true_false';
    if(quiz.hasClass('multi'))
      type = 'multiple';
    if(quiz.hasClass('fill'))
      type = 'gap_fill';
    if(quiz.hasClass('essay'))
      type = 'essay';
    element.attr('data-type', LOCAL.quiz[type]);
  });

  $.each('.quiz .mistake', function(element) {
    element.attr('data-type', LOCAL.quiz.mistake);
  });

  $.each('div.tags a', function(element) {
    element.className = ['primary', 'success', 'info', 'warning', 'danger'][Math.floor(Math.random() * 5)];
  });

};

const tabFormat = function() {
  // tab
  var first_tab;
  //function(element, index)
  $.each('div.tab', function(element,_) {
    if(element.attr('data-ready')){ return; }

    var id = element.attr('data-id');
    var title = element.attr('data-title');
    var box = $('#' + id);
    if(!box) {
      box = document.createElement('div');
      box.className = 'tabs';
      box.id = id;
      box.innerHTML = '<div class="show-btn"></div>';

      var showBtn = box.child('.show-btn');
      showBtn.addEventListener('click', function(event) {
        pageScroll(box);
      });

      element.parentNode.insertBefore(box, element);
      first_tab = true;
    } else { first_tab = false; }

    var ul = box.child('.nav ul');
    if(!ul) {
      ul = box.createChild('div', {
        className: 'nav',
        innerHTML: '<ul></ul>'
      }).child('ul');
    }

    var li = ul.createChild('li', {
      innerHTML: title
    });

    if(first_tab) {
      li.addClass('active');
      element.addClass('active');
    }

    li.addEventListener('click', function(event) {
      var target = event.currentTarget;
      box.find('.active').forEach(function(el) {
        el.removeClass('active');
      });
      element.addClass('active');
      target.addClass('active');
    });

    box.appendChild(element);
    element.attr('data-ready', true);
  });
};

const loadComments = function() {
  var element = $('#comments');
  if (!element) {
    goToComment.display("none");
    return;
  } else { goToComment.display(""); }

  if (!window.IntersectionObserver) {
    vendorCss_body('waline_crop');
  } else {
    var io = new IntersectionObserver(function(entries, observer) {
      var entry = entries[0];
      vendorCss_body('waline_crop');
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        transition($('#comments'), 'bounceUpIn');
        observer.disconnect();
      }
    });

    io.observe(element);
  }
};

const algoliaSearch = function(pjax) {
  if(CONFIG.search === null){ return; }

  if(!siteSearch) {
    siteSearch = BODY.createChild('div', {
      id: 'search',
      innerHTML: '<div class="inner"><div class="header"><span class="icon"><i class="ic i-search"></i></span><div class="search-input-container"></div><span class="close-btn"><i class="ic i-times-circle"></i></span></div><div class="results"><div class="inner"><div id="search-stats"></div><div id="search-hits"></div><div id="search-pagination"></div></div></div></div>'
    });
  }

  var search = instantsearch({
    indexName: CONFIG.search.indexName,
    searchClient  : algoliasearch(CONFIG.search.appID, CONFIG.search.apiKey),
    searchFunction: function(helper) {
      var searchInput = $('.search-input');
      if (searchInput.value) { helper.search(); }
    }
  });

  search.on('render', function() {
    pjax.refresh($('#search-hits'));
  });

  // Registering Widgets
  search.addWidgets([
    instantsearch.widgets.configure({
      hitsPerPage: CONFIG.search.hits.per_page || 10
    }),

    instantsearch.widgets.searchBox({
      container           : '.search-input-container',
      placeholder         : LOCAL.search.placeholder,
      // Hide default icons of algolia search
      showReset           : false,
      showSubmit          : false,
      showLoadingIndicator: false,
      cssClasses          : {
        input: 'search-input'
      }
    }),

    instantsearch.widgets.stats({
      container: '#search-stats',
      templates: {
        text: function(data) {
          var stats = LOCAL.search.stats
            .replace(/\$\{hits}/, data.nbHits)
            .replace(/\$\{time}/, data.processingTimeMS);
          return stats + '<span class="algolia-powered"></span><hr>';
        }
      }
    }),

    instantsearch.widgets.hits({
      container: '#search-hits',
      templates: {
        item: function(data) {
          var cats = data.categories ? '<span>'+data.categories.join('<i class="ic i-angle-right"></i>')+'</span>' : '';
          return '<a href="' + CONFIG.root + data.path +'">'+cats+data._highlightResult.title.value+'</a>';
        },
        empty: function(data) {
          return '<div id="hits-empty">'+
              LOCAL.search.empty.replace(/\$\{query}/, data.query) +
            '</div>';
        }
      },
      cssClasses: {
        item: 'item'
      }
    }),

    instantsearch.widgets.pagination({
      container: '#search-pagination',
      scrollTo : false,
      showFirst: false,
      showLast : false,
      templates: {
        first   : '<i class="ic i-angle-double-left"></i>',
        last    : '<i class="ic i-angle-double-right"></i>',
        previous: '<i class="ic i-angle-left"></i>',
        next    : '<i class="ic i-angle-right"></i>'
      },
      cssClasses: {
        root        : 'pagination',
        item        : 'pagination-item',
        link        : 'page-number',
        selectedItem: 'current',
        disabledItem: 'disabled-item'
      }
    })
  ]);

  search.start();

  // Handle and trigger popup window
  $.each('.search', function(element) {
    element.addEventListener('click', function() {
      document.body.style.overflow = 'hidden';
      transition(siteSearch, 'shrinkIn', function() {
          $('.search-input').focus();
      }); // transition.shrinkIn
    });
  });

  // Monitor main search box
  const onPopupClose = function() {
    document.body.style.overflow = '';
    transition(siteSearch, 0); // "transition.shrinkOut"
  };

  siteSearch.addEventListener('click', function(event) {
    if (event.target === siteSearch) {
      onPopupClose();
    }
  });
  $('.close-btn').addEventListener('click', onPopupClose);
  window.addEventListener('pjax:success', onPopupClose);
  window.addEventListener('keyup', function(event) {
    if (event.key === 'Escape') {
      onPopupClose();
    }
  });
};
const domInit = function() {
  $.each('.overview .menu > .item', function(el) {
    siteNav.child('.menu').appendChild(el.cloneNode(true));
  });

  loadCat.addEventListener('click', Loader.vanish);
  menuToggle.addEventListener('click', sideBarToggleHandle);
  $('.dimmer').addEventListener('click', sideBarToggleHandle);

  quickBtn.child('.down').addEventListener('click', goToBottomHandle);
  quickBtn.child('.up').addEventListener('click', backToTopHandle);
  if(!toolBtn) {
    toolBtn = siteHeader.createChild('div', {
      id: 'tool',
      innerHTML: '<div class="item contents"><i class="ic i-list-ol"></i></div><div class="item chat"><i class="ic i-comments"></i></div><div class="item back-to-top"><i class="ic i-arrow-up"></i><span>0%</span></div>'
    });
  }

  backToTop = toolBtn.child('.back-to-top');
  goToComment = toolBtn.child('.chat');
  showContents = toolBtn.child('.contents');

  backToTop.addEventListener('click', backToTopHandle);
  goToComment.addEventListener('click', goToCommentHandle);
  showContents.addEventListener('click', sideBarToggleHandle);
};

const pjaxReload = function() {
  pagePosition();

  if(sideBar.hasClass('on')) {
    transition(sideBar, function() {
        sideBar.removeClass('on');
        menuToggle.removeClass('close');
      }); // 'transition.slideRightOut'
  }

  $('#main').innerHTML = '';
  $('#main').appendChild(loadCat.lastChild.cloneNode(true));
  pageScroll(0);
};

const recent_comment_create = function(comments) {
  var waline_recent = $('#waline-recent');

  if(waline_recent.hasChildNodes())
  {
    var parent_label = waline_recent.parentNode;

    parent_label.removeChild(waline_recent);
    parent_label.appendChild(waline_recent.cloneNode(false));
  }

  var len = comments.length;
  if(0 == len){ return; }

  var getDate = function(timestamp) {
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    return year + '-' + month + '-' + day;
  };
  var getText = function(new_text) {
    new_text = new_text.replace(/\n/g, '');
    var place_text = '';
    var text_size = 100;
    var len = new_text.length;
    var smallest = [
      'r','g','t','j',
      'f','i','v','y',
      'x','z',',','.',
      '!',';',':','"',
      '(',')','-',' '
    ];
    var regex = /[a-z]/;
    var regex2 = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/;
    var regex3 = /[A-Z]/;

    for(var i = 0,count = 0;i < len;)
    {
      if('<' == new_text[i])
      { 
        while(i < len && '>' != new_text[i++]);
        continue;
      }
      if(count >= text_size)
      {
        if(i < len){ place_text += '...'; }
        break; 
      }
      var c = new_text[i++];
      if(c in smallest){ count += 1; }
      else if(regex.test(c) || regex2.test(c)){ count += 2; }
      else if(regex3.test(c)){ count += 2.5; }
      else{ count += 3.5; }
      
      place_text += c;
    }
  
    return place_text;
  };

  var i = 0;
  var li_label = document.createElement('li');
  li_label.setAttribute('class','item');
  
  var a_label = document.createElement('a');
  a_label.setAttribute('href',comments[i].url);
  a_label.setAttribute('data-pjax-state','');

  var breadcrumb_label = document.createElement('span');
  breadcrumb_label.style.marginBottom = '-5.3px';
  breadcrumb_label.innerText = comments[i].nick + ' @ ' + getDate(comments[i].time);

  var text_span = document.createElement('span');
  text_span.innerText = getText(comments[i].comment);

  waline_recent = $('#waline-recent');
  a_label.appendChild(breadcrumb_label);
  a_label.appendChild(text_span);
  li_label.appendChild(a_label);
  waline_recent.append(li_label);

  for(++i;i < len;++i)
  {
    var new_li_label = li_label.cloneNode(false);
    var new_a_label = a_label.cloneNode(false);
    new_a_label.setAttribute('href',comments[i].url);

    var new_breadcrumb_label = breadcrumb_label.cloneNode(false);
    new_breadcrumb_label.innerText = comments[i].nick + ' @ ' + getDate(comments[i].time);

    var new_text_span = text_span.cloneNode(false);
    new_text_span.innerText = getText(comments[i].comment);

    new_a_label.appendChild(new_breadcrumb_label);
    new_a_label.appendChild(new_text_span);
    new_li_label.appendChild(new_a_label);
    waline_recent.append(new_li_label);
  }
};

const waline_create = function() {
  if(CONFIG.waline.serverURL)
  {
    // vendorCss_body('waline');
    var getScript = function(options) {
      var name = 'script-waline';
      var old_script = document.querySelector('body script' + '.' + name);
      if(old_script){ document.body.removeChild(old_script); }

      var script = document.createElement('script');
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('class','script-waline');
      Object.keys(options).forEach(function(key) {
          script[key] = options[key];
      });
      document.body.appendChild(script);
    };

    getScript({
      src: assetUrl('js','waline'),
      onload: function() {
        var options = Object.assign({}, CONFIG.waline);
        options = Object.assign(options, LOCAL.waline||{});

        Waline.RecentComments({
          serverURL: options.serverURL,
          count: 10,
        }).then(({ comments }) => { recent_comment_create(comments.data); });

        if($('#waline-comment'))
        {
          options.el = '#waline-comment';
          Waline.init(options);

          setTimeout(function(){
            positionInit(1);
            postFancybox('#waline-comment');
          }, 1000);
        }
      }
    });
  }
};

const siteRefresh = function(reload) {
  LOCAL_HASH = 0;
  LOCAL_URL = window.location.href;

  vendorCss('katex');
  vendorJs('copy_tex');
  vendorJs('chart');
  
  if(!reload) { $.each('script[data-pjax]', pjaxScript); }
  waline_create();

  originTitle = document.title;

  resizeHandle();

  menuActive();

  sideBarTab();
  sidebarTOC();

  registerExtURL();
  postBeauty();
  tabFormat();

  Loader.hide();

  setTimeout(function(){
    positionInit();
  }, 500);

  cardActive();

  lazyload.observe();
};

const siteInit = function() {
  domInit();

  pjax = new Pjax({
            selectors: [
              'head title',
              '.languages',
              '.pjax',
              'script[data-config]'
            ],
            analytics: false,
            cacheBust: false
          });

  CONFIG.quicklink.ignores = LOCAL.ignores;
  quicklink.listen(CONFIG.quicklink);

  visibilityListener();
  themeColorListener();

  algoliaSearch(pjax);

  siteRefresh(1);
  window.addEventListener('scroll', scrollHandle);
  window.addEventListener('resize', resizeHandle);
  window.addEventListener('pjax:send', pjaxReload);
  window.addEventListener('pjax:success', siteRefresh);
  window.addEventListener('beforeunload', function() {
    pagePosition();
  });
};

window.addEventListener('DOMContentLoaded', siteInit);
// console.log('%c Theme.Shoka.Derived v' + CONFIG.version + ' %c https://github.com/ReverseSacle/hexo-theme-shoka-derived ', 'color: white; background: #e9546b; padding:5px 0;', 'padding:4px;border:1px solid #e9546b;')
