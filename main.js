// ==UserScript==
// @name         SearchInBilibili
// @namespace    SearchInBilibili
// @version      0.3
// @description  Search related videos in bilibili right in a niconico video page
// @author       lhc70000
// @include      http://www.nicovideo.jp/watch/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js
// @grant        GM_xmlhttpRequest
// @connect      search.bilibili.com
// @connect      hdslb.com
// ==/UserScript==
(function () {
    var cssText = '\
body>.biliHintBox {\
color: #333;\
font-family: "Microsoft YaHei", Arial, Helvetica, sans-serif;\
position: fixed;\
width: 240px;\
padding: 1em;\
font-size: 11px;\
border-radius:3px;\
background-color: rgba(255,255,255,.8);\
box-shadow: 0 0 8px #999;\
z-index: 5004;\
}\
body>.biliHintBox em {\
background-color: #ffffaa;\
}\
#searchInBilibili {\
position: relative;\
display: table-cell;\
vertical-align: middle;\
}\
#searchInBilibili>a {\
height: 20px;\
color: #fff;\
margin-left: 20px;\
padding: 3px 6px 2px 6px;\
border: none;\
border-radius: 2px;\
background-color: #ffafc9;\
text-decoration: none;\
cursor: pointer;\
}\
#searchInBilibili>.searchBox {\
display: none;\
color: #333;\
font-size: 11px;\
position: absolute;\
background: #f5f5f5;\
right: 135px;\
width: 360px;\
height: 320px;\
top: -200px;\
z-index: 5000;\
overflow: auto;\
box-shadow: 0 0 8px #999;\
border: 1px solid #555;\
border-radius: 3px;\
padding: 1em;\
}\
#searchInBilibili>.searchBox center {\
font-size: 14px;\
padding-top: 40px;\
}\
#searchInBilibili.open>.searchBox {\
display:block;\
}\
#searchInBilibili.open>.searchBox>.video {\
font-family: "Microsoft YaHei", Arial, Helvetica, sans-serif;\
width: 100%;\
border-bottom: 1px solid #e5e5e5;\
padding: 0.5em 0;\
}\
#searchInBilibili.open>.searchBox>.video:hover {\
background-color: #e5e5e5;\
}\
#searchInBilibili.open>.searchBox>.video:after {\
clear: both;\
}\
#searchInBilibili>.searchBox>.video .img {\
float: left;\
position: relative;\
margin-right: 10px;\
}\
#searchInBilibili>.searchBox>.video .img>img {\
width: 80px;\
height: 50px;\
}\
#searchInBilibili>.searchBox>.video .img>span {\
position: absolute;\
padding: 0 3px;\
right: 0;\
bottom: 0;\
background-color:rgba(100,100,100,.6);\
font-size: 9px;\
color: #fff\
}\
#searchInBilibili>.searchBox>.video .info {\
position: relative;\
}\
#searchInBilibili>.searchBox>.video .info>.des {\
display: none;\
clear: both;\
}\
#searchInBilibili>.searchBox>.video .info>.headline {\
height: 32px;\
overflow: hidden;\
}\
#searchInBilibili>.searchBox>.video .info>.headline span{\
padding: 0;\
font-weight: normal;\
}\
#searchInBilibili>.searchBox>.video .info>.headline span.avid{\
display:none;\
}\
#searchInBilibili>.searchBox>.video .info>.headline span.type{\
padding: 0 8px;\
font-size: 10px;\
border: 1px solid #ccc;\
border-radius: 8px;\
}\
#searchInBilibili>.searchBox>.video .info>.tags {\
margin-top: 2px;\
height: 16px;\
overflow: hidden;\
}\
#searchInBilibili>.searchBox>.video .info>.tags span{\
color: #aaa;\
font-size: 11px;\
font-weight: normal;\
padding-left: 0;\
padding-right: 4px;\
}\
#searchInBilibili>.searchBox>.video .info>.tags span:after {\
content: " / ";\
}\
#searchInBilibili>.searchBox>.video .info>.tags .watch-num:before {\
content: "\\25B8";\
}\
#searchInBilibili>.searchBox>.video .info>.tags .hide:before {\
content: "\\2261";\
}\
#searchInBilibili>.searchBox>.video .info>.tags a {\
color: #777;\
}\
#searchInBilibili>.searchBox .nicozonBtn,\
#searchInBilibili>.searchBox .bdBtn {\
display: block;\
padding: 5px 0;\
text-align: center;\
color: #fff;\
border-radius: 3px;\
margin-top: 10px;\
}\
#searchInBilibili>.searchBox .nicozonBtn {\
background: #555;\
}\
#searchInBilibili>.searchBox .bdBtn {\
background: #2bc6f9;\
}\
';
    $('head').append($('<style>' + cssText + '</style>'));
    $(function () {
        var smNum;
        var li = $('<div id="searchInBilibili"><a>Bilibili で検索</a></div>');
        var searchBtn = li.find('a');
        var searchWindow = $('<div class="searchBox"></div>').appendTo(li);
        var hintBox = $('<div class="biliHintBox"></div>').appendTo($('body')).hide();
        var showHint = function (text, pos) {
            hintBox.html(text).offset(pos).show();
        };
        var hideHint = function () {
            hintBox.hide();
        };
        var formatDate = function (date) {
            return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
        };
        var buildHTML = function (data) {
            return $('<div class="video matrix"><a href="' + data.arcurl + '" target="_blank" title="' + data.title + '"><div class="img"><img alt="" url="https:' + data.pic + '@320w_200h.jpg"></div></a><div class="info"><div class="headline clearfix"><span class="type avid">av' + data.id + '</span><span class="type hide">' + data.typename + '</span><a title="' + data.title + '" href="' + data.arcurl + '" target="_blank" class="title">' + data.title + '</a></div><div class="des hide">' + data.description + '</div><div class="tags"><span title="观看" class="so-icon watch-num"><i class="icon-playtime"></i>' + data.play + '</span><span title="弹幕" class="so-icon hide"><i class="icon-subtitle"></i>' + data.video_review + '</span><span title="上传时间" class="so-icon time"><i class="icon-date"></i>' + formatDate(new Date(data.pubdate*1000)) + '</span><span title="up主" class="so-icon"><i class="icon-uper"></i><a href="//space.bilibili.com/797614?from=search&amp;seid=9904936649729939500" target="_blank" class="up-name">' + data.author + '</a></span></div></div></div>');
        };
        var loadImg = function(i, e) {
            var img = $(e);
            var url = img.attr("url");
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                headers: {
                    referer: 'http://search.bilibili.com/all?keyword=' + smNum
                },
                responseType: 'blob',
                onload: function (response) {
                    var reader = new FileReader();
                    reader.onloadend = function() {
                        img.attr("src", reader.result);
                    };
                    reader.readAsDataURL(response.response);
                }
            });
        };
        var bResult;
        // on click
        searchBtn.on('click', function () {
            var self = li;
            if (self.hasClass('open')) {
                self.removeClass('open');
            } else {
                self.addClass('open');
                var newSmNum = document.location.pathname.split('/').pop();
                var bLink = 'http://search.bilibili.com/api/search?search_type=all&keyword=' + newSmNum;
                var nicozonLink =  'http://www.nicozon.net/downloader.html?video_id=' + newSmNum + '&eco=0/';;
                var bdLink = 'https://www.google.com.hk/?gws_rd=ssl#newwindow=1&safe=strict&q=' + $('#videoHeaderDetail h2').text() + ' site:pan.baidu.com';
                if (newSmNum != smNum) {
                    smNum = newSmNum;
                } else if (self.hasClass('loaded')) {
                    return;
                }
                // perform search if never searched
                searchWindow.html('<center>検索中<br/>しばらく待ってください</center>');
                GM_xmlhttpRequest({
                    method: "GET",
                    url: bLink,
                    onload: function (response) {
                        var bResult = JSON.parse(response.responseText).result.video.map(buildHTML).reduce(function(a,c){return a.add(c);});
                        // add download link from bilibilijj
                        bResult.each(function () {
                            var vm = $(this);
                            var jjLink = vm.find('.headline a').attr('href').replace('bilibili', 'bilibilijj');
                            vm.find('.tags').append($('<span><a href="' + jjLink + '" target="_blank">DL</a></span>'));
                        });
                        // append result
                        searchWindow.empty();
                        searchWindow.append('結果：' + bResult.length + '件');
                        searchWindow.append(bResult);
                        searchWindow.append('<a class="nicozonBtn" target="_blank" href="' + nicozonLink + '">Nicozon で動画を保存</a>');
                        searchWindow.append('<a class="bdBtn" target="_blank" href="' + bdLink + '">BaiduNetdisk で検索</a>');
                        self.addClass('loaded');
                        bResult.find("img").each(loadImg);
                    }
                });
                // close search window when clicking outside
                window.setTimeout(function () {
                    $('body').one('click', function () {
                        self.removeClass('open');
                    });
                }, 10);
            }
        });
        var ul = $('.VideoMetaContainer');
        ul.append(li);
    });
})();
