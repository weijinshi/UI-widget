; (function($, undefined) {
    'use strict';

    var pluginName = 'calendarview';
    var pluginGlobal = {
        _template: {
            wrapper: '<div class="container calendarview-wrapper"></div>',
            row: '<div class="row"></div>',
            col_md_5: '<div class="col-md-5"></div>',
            col_md_2: '<div class="col-md-2"></div>',
            operationDiv: '<div class="calendarview-operation"></div>',
            yearPrev: '<span class="calendarview-operation-btn year_prev_btn"><span class="icon icon-paging-left"></span></span>',
            yearShow: '<span class="calendarview-operation-year-label"></span>',
            yearNext: '<span class="calendarview-operation-btn year_next_btn"><span class="icon icon-paging-right"></span></span>',
            monthNav: '<div class="month-nav"></div>',
            monthNavItem: '<li class="month-nav-item"></li>',
            monthTitle: '<div class="month-title"></div>',
            calendarTable: '<table class="calendar-table" cellpadding="0" cellspacing="0" onselectstart="return false;"></table>',
            noteCalendarDateText: '<div class="notecalendar-datetext"></div>',
            noteCalendarExtendsion: '<div class="notecalendar-extension"></div>',
            dayStatusIcon: [
            	'',
            	'<span class="icon icon-holiday-status6"></span>',
            	'<span class="icon icon-holiday-status1"></span>',
            	'<span class="icon icon-holiday-status2"></span>',
            	'<span class="icon icon-holiday-status3"></span>',
            	'<span class="icon icon-holiday-status4"></span>',
             	'<span class="icon icon-holiday-status5"></span>',
                '<span class="icon icon-holiday-status7"></span>',
                '<span class="icon icon-holiday-status8"></span>'
            ],
            noteCalendarSelectedIcon: '<div class="notecalendar-selectedicon"><span class="icon icon-selected"></span></div>',
            colortips: '<ul class="colortips">' +
                '	<li><span class="non-working"></span>' + vCloud.i18n.get('PTO_Personal_Index_NonWorking', 'Non-working') + '</li>' +
                '	<li><span class="taken"></span>' + vCloud.i18n.get('PTO_Plugin_RequestStatus_Taken', 'Taken') + '</li>' +
                '    <li><span class="approved"></span>' + vCloud.i18n.get('PTO_Plugin_RequestStatus_Approved', 'Approved') + '</li>' +
                '    <li><span class="rejected"></span>' + vCloud.i18n.get('PTO_Plugin_RequestStatus_Rejected', 'Rejected') + '</li>' +
                '    <li><span class="pending"></span>' + vCloud.i18n.get('PTO_Plugin_RequestStatus_Pending', 'Pending') + '</li>' +
                '    <li><span class="taking"></span>' + vCloud.i18n.get('PTO_Plugin_RequestStatus_Taking', 'Taking') + '</li>' +
                '    <li><span class="mutiple-requests"></span>' + vCloud.i18n.get('PTO_Plugin_RequestStatus_MultipleRequests', 'Mutiple Reuqests') + '</li>' +
                '    <li><span class="cancelled"></span>' + vCloud.i18n.get('PTO_Plugin_RequestStatus_Cancelled', 'Cancelled') + '</li>' +
                '</ul>',
        },
        dayStatus: ['non-working', 'taken', 'approved', 'rejected', 'pending', 'taking', 'mutiple-requests', 'cancelled', 'holiday'],
        months: [
                vCloud.i18n.get('PTO_Plugin_Calendar_Jan', 'Jan'),
                vCloud.i18n.get('PTO_Plugin_Calendar_Feb', 'Feb'),
                vCloud.i18n.get('PTO_Plugin_Calendar_Mar', 'Mar'),
                vCloud.i18n.get('PTO_Plugin_Calendar_Apr', 'Apr'),
                vCloud.i18n.get('PTO_Plugin_Calendar_May', 'May'),
                vCloud.i18n.get('PTO_Plugin_Calendar_Jun', 'Jun'),
                vCloud.i18n.get('PTO_Plugin_Calendar_Jul', 'Jul'),
                vCloud.i18n.get('PTO_Plugin_Calendar_Aug', 'Aug'),
                vCloud.i18n.get('PTO_Plugin_Calendar_Sep', 'Sep'),
                vCloud.i18n.get('PTO_Plugin_Calendar_Oct', 'Oct'),
                vCloud.i18n.get('PTO_Plugin_Calendar_Nov', 'Nov'),
                vCloud.i18n.get('PTO_Plugin_Calendar_Dec', 'Dec'),
        ],
        fullMonths: [
                vCloud.i18n.get('PTO_Plugin_Calendar_January', 'January'),
                vCloud.i18n.get('PTO_Plugin_Calendar_February', 'February'),
                vCloud.i18n.get('PTO_Plugin_Calendar_March', 'March'),
                vCloud.i18n.get('PTO_Plugin_Calendar_April', 'April'),
                vCloud.i18n.get('PTO_Plugin_Calendar_May', 'May'),
                vCloud.i18n.get('PTO_Plugin_Calendar_June', 'June'),
                vCloud.i18n.get('PTO_Plugin_Calendar_July', 'July'),
                vCloud.i18n.get('PTO_Plugin_Calendar_August', 'August'),
                vCloud.i18n.get('PTO_Plugin_Calendar_September', 'September'),
                vCloud.i18n.get('PTO_Plugin_Calendar_October', 'October'),
                vCloud.i18n.get('PTO_Plugin_Calendar_November', 'November'),
                vCloud.i18n.get('PTO_Plugin_Calendar_December', 'December'),
        ],
        weeks: [
                vCloud.i18n.get('PTO_Plugin_DoubleCalendar_SUN', 'Sun'),
                vCloud.i18n.get('PTO_Plugin_DoubleCalendar_MON', 'Mon'),
                vCloud.i18n.get('PTO_Plugin_DoubleCalendar_TUE', 'Tue'),
                vCloud.i18n.get('PTO_Plugin_DoubleCalendar_WED', 'Wed'),
                vCloud.i18n.get('PTO_Plugin_DoubleCalendar_THU', 'Thu'),
                vCloud.i18n.get('PTO_Plugin_DoubleCalendar_FRI', 'Fri'),
                vCloud.i18n.get('PTO_Plugin_DoubleCalendar_SAT', 'Sat'),
                vCloud.i18n.get('PTO_Plugin_DoubleCalendar_SUN', 'Sun'),
        ],
        currentDate: new Date(),
        isLeapYear: function(year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
        },
        getDaysInMonth: function(year, month) {
            return [31, (pluginGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        },
        getFirstDayOfMonth: function(year, month) {
            var tempDate = new Date();
            tempDate.setFullYear(year);
            tempDate.setMonth(month);
            var firstDay = 7 - (tempDate.getDate() - tempDate.getDay() - 1) % 7;
            return firstDay >= 7 ? firstDay - 7 : firstDay;
        },
        isObjInArray: function(array, object) {
            for (var i = array.length - 1; i >= 0; i--) {
                if (array[i] === object) {
                    return true;
                }
            }
            return false;
        },
    };

    var calendarview = Class.extend({
        $element: null,
        $wrapper: null,
        yearShow: null,
        monthShow: null,
        selectedDays: [],
        options: null,
        requestsDataToShow: [],
        holidays: [],

        ctor: function(element, options) {
            this.$element = $(element);
            this.yearShow = pluginGlobal.currentDate.getFullYear();
            this.monthShow = pluginGlobal.currentDate.getMonth();

            this.initialized = false;
            this._init(options);
        },
        remove: function() {
            this._destroy();
            $.removeData(this, 'plugin_' + pluginName);
        },
        getSelectedDays: function() {
            return $.map($('td.notecalendar-selected').children(), function(item) { return $(item).attr('data-real-date'); });
        },
        setRequestData: function(requestsData) {
            if (!requestsData || requestsData.length == 0) {
                return;
            }
            var self = this;
            self.requestsDataToShow = requestsData;
            self._render();
        },
        setHolidayData: function(holidaysData) {
            if (!holidaysData || holidaysData.length == 0) {
                return;
            }
            var self = this;
            self.holidays = holidaysData;
            self._render();
        },
        _init: function(options) {
            if (options.data) {
                if (typeof options.data === 'string') {
                    options.data = $.parseJSON(options.data);
                }
                self.data = $.extend(true, null, options.data);
                delete options.data;
            }
            this.options = $.extend({}, calendarview.defaults, options);

            this._destroy();
            this._registerEvents();
            this._render();
        },
        _destroy: function() {
            if (this.initialized) {
                this.$wrapper.remove();
                this.$wrapper = null;
                this._unRegisterEvents();
            }
            this.initialized = false;
        },
        _unRegisterEvents: function() {
            this.$element.off('click');
        },
        _registerEvents: function() {
            var self = this;
            self._unRegisterEvents();
            self.$element.on('click', '.year_prev_btn', prevYearBtnClick);
            self.$element.on('click', '.year_next_btn', nextYearBtnClick);
            self.$element.on('click', '.month-nav-item', monthNavItemClick);

            self.$element.on('click', '.calendar-td > div', calendarTdClick);

            if (self.options.yearNextorPrevBtnClickCallback && typeof (self.options.yearNextorPrevBtnClickCallback === 'function')) {
                self.$element.on(
                    'click',
                    '.calendarview-operation-btn',
                    {callback: self.options.yearNextorPrevBtnClickCallback },
                    function(e) {
                        var callback = e.data.callback;
                        callback(self.yearShow);
                        return false;
                    }
                );
            }

            if (self.options.showTooltipCallback && typeof (self.options.showTooltipCallback) === 'function') {
                self.$element.on(
            		'click',
            		'.calendar-td',
            		{ callback: self.options.showTooltipCallback },
            		function(e) {
            		    var $tdDiv = $(this).children();
            		    if ($tdDiv.hasClass('hasTooltip')) {
            		        var date = $tdDiv.attr('data-real-date');
            		        var requests = $tdDiv.data('requests');
            		        var holidays = $tdDiv.data('holidays');
            		        var callback = e.data.callback;
            		        callback(date, requests, holidays);
            		        return false;
            		    }
            		}
            	);
            }

            function prevYearBtnClick() {
                self.yearShow--;
                self._render();
            }
            function nextYearBtnClick() {
                self.yearShow++;
                self._render();
            }
            function monthNavItemClick() {
                self.monthShow = parseInt($(this).attr('data-month-nav-index'));
                self._render();
            }
            function calendarTdClick(event) {
                var $td = $(this).parent();
                var $tdDiv = $td.children();
                if (!$td.hasClass('unselectable')) {
                    var clickDay = $tdDiv.attr('data-real-date');
                    var isSelected = $td.hasClass('notecalendar-selected') ? true : false;
                    if (event.shiftKey) {
                        // shift key 
                        var shiftStartEnd = [];
                        var selectedDays = self.getSelectedDays();
                        if (selectedDays.length > 0) {
                            if (clickDay < selectedDays[0]) {
                                shiftStartEnd[0] = clickDay;
                                shiftStartEnd[1] = selectedDays[selectedDays.length - 1];
                            }
                            else {
                                shiftStartEnd[0] = selectedDays[0];
                                shiftStartEnd[1] = clickDay;
                            }
                        }
                    }
                    self.$element.find('.calendar-table').find('.notecalendar-selected').find('.td-selected-border').hide();
                    self.$element.find('.calendar-table').find('td').removeClass('notecalendar-selected');

                    if (isSelected) {
                        $td.removeClass('notecalendar-selected');
                    } else {
                        $td.addClass('notecalendar-selected');
                    }
                }
                // for shift
                if (event.shiftKey) {
                    var allSelectableDiv = self.$element.find('.calendar-td:not(.non-working)').children();
                    var allSelectableDate = $.map(allSelectableDiv, function(item) { return $(item).attr('data-real-date'); });
                    if (shiftStartEnd.length == 2) {
                        if (shiftStartEnd[0] < shiftStartEnd[1]) {
                            var start = shiftStartEnd[0];
                            var end = shiftStartEnd[1];
                        }
                        else {
                            var start = shiftStartEnd[1];
                            var end = shiftStartEnd[0];
                        }
                        var startIndex = allSelectableDate.indexOf(start);
                        var endIndex = allSelectableDate.indexOf(end);
                        for (var i = startIndex; i <= endIndex; i++) {
                            if (!$(allSelectableDiv[i]).parent().hasClass('unselectable')) {
                                $(allSelectableDiv[i]).parent().addClass('notecalendar-selected');
                            }
                        }
                    }
                }

                if (self.$element.find('.calendar-table').find('.notecalendar-selected')) {
                    self.$element.find('.calendar-table').find('.notecalendar-selected').find('.td-selected-border').show();
                } else {
                    self.$element.find('.calendar-table').find('.notecalendar-selected').find('.td-selected-border').hide();
                }

                self.selectedDays = self.getSelectedDays();
            }
        },
        _render: function() {
            var self = this;
            if (!self.initialized) {
                self.$element.addClass(pluginName);
                self.$wrapper = $(pluginGlobal._template.wrapper);
            }
            self.$element.empty().append(self.$wrapper.empty());

            self._buildMonthNav();
            self._buildDoubleCalendar();
        },
        _buildMonthNav: function() {
            var self = this;

            var row = $(pluginGlobal._template.row);

            var operation = $(pluginGlobal._template.operationDiv);
            operation.append(pluginGlobal._template.yearPrev);
            operation.append($(pluginGlobal._template.yearShow).text(self.yearShow));
            operation.append(pluginGlobal._template.yearNext);
            row.append(operation);

            var monthNav = $(pluginGlobal._template.monthNav);
            for (var i = 0, size = pluginGlobal.months.length; i < size; i++) {
                var monthNavItem = $(pluginGlobal._template.monthNavItem);
                monthNavItem.attr('data-month-nav-index', i);
                monthNavItem.text(pluginGlobal.months[i]);
                if (i === self.monthShow || i === (self.monthShow + 1)) {
                    monthNavItem.addClass('selected');
                    monthNavItem.addClass('theme');
                }
                monthNav.append(monthNavItem);
            }
            row.append(monthNav);

            self.$wrapper.append(row);
        },
        _buildDoubleCalendar: function() {
            var self = this;

            var row = $(pluginGlobal._template.row);

            var monthTitle = $(pluginGlobal._template.monthTitle).text(pluginGlobal.fullMonths[self.monthShow] + ', ' + self.yearShow);
            var calendarTable = getcalendarTable(self.yearShow, self.monthShow);
            row.append($(pluginGlobal._template.col_md_5).append(monthTitle).append(calendarTable));

            var monthNext = self.monthShow < 11 ? self.monthShow + 1 : 0;
            var yearNext = self.monthShow < 11 ? self.yearShow : self.yearShow + 1;
            var monthTitleNext = $(pluginGlobal._template.monthTitle).text(pluginGlobal.fullMonths[monthNext] + ', ' + yearNext);
            var calendarTableNext = getcalendarTable(yearNext, monthNext);
            row.append($(pluginGlobal._template.col_md_5).append(monthTitleNext).append(calendarTableNext));

            row.append($(pluginGlobal._template.col_md_2).append(pluginGlobal._template.colortips));

            self.$wrapper.append(row);

            function getcalendarTable(year, month) {
                var $table = $(pluginGlobal._template.calendarTable);
                var $firstTr = $('<tr>');
                for (var i = 0; i < 7; i++) {
                    $firstTr.append($('<th class="theme">').text(pluginGlobal.weeks[i]));
                }
                $table.append($firstTr);

                var firstDayOfMonth = pluginGlobal.getFirstDayOfMonth(year, month);
                var daysInMonth = pluginGlobal.getDaysInMonth(year, month);
                for (var i = 0, dayLabel = 0; i < 6; i++) {
                    var $tr = $('<tr>');
                    for (var k = 0; k < 7; k++) {
                        var $td = $('<td class="calendar-td">');
                        var $tdContainer = $('<div>');

                        // set non-working day background
                        if (self.options && self.options.workingDays && self.options.workingDays.length == 7) {
                            if (!self.options.workingDays[k]) {
                                $td.addClass('unselectable').addClass('non-working');
                                $tdContainer.addClass('unselectable').addClass('non-working');
                            }
                        }

                        // set date text label
                        var dateText = $(pluginGlobal._template.noteCalendarDateText);
                        if (i === 0 && k === firstDayOfMonth) {
                            dateText.text(++dayLabel);
                        } else if (dayLabel > 0 && dayLabel < daysInMonth) {
                            dateText.text(++dayLabel);
                        } else {
                            $td.addClass('unselectable');
                            $tdContainer.addClass('unselectable');
                        }

                        var monthText = (month + 1) < 10 ? ('0' + (month + 1)) : month + 1;
                        var dayText = dayLabel < 10 ? ('0' + dayLabel) : dayLabel;
                        var presentDate = year + '-' + monthText + '-' + dayText;
                        $tdContainer.attr('data-real-date', presentDate);

                        var $extension = $(pluginGlobal._template.noteCalendarExtendsion);

                        // holiday data
                        var holidaysOnDate = self.holidays[presentDate];
                        if (holidaysOnDate && holidaysOnDate.length > 0) {
                            $td.addClass('unselectable');
                            $tdContainer.addClass('unselectable hasTooltip');
                            $tdContainer.data('holidays', holidaysOnDate);
                            $td.addClass(pluginGlobal.dayStatus[8]);
                            $tdContainer.addClass(pluginGlobal.dayStatus[8]);
                            $extension.append(pluginGlobal._template.dayStatusIcon[8]);
                        }

                        // request data
                        if (!$td.hasClass('unselectable')) {
                            var requests = getRequestOnDay(presentDate);
                            if (requests && requests.length > 0) {
                                $tdContainer.addClass('hasTooltip');
                                $tdContainer.data('requests', requests);
                                // just show the last request status
                                if (requests.length > 1) {
                                    //$td.addClass('unselectable').addClass(pluginGlobal.dayStatus[6]);
                                    //$tdContainer.addClass('unselectable').addClass(pluginGlobal.dayStatus[6]);
                                    $td.addClass(pluginGlobal.dayStatus[6]);
                                    $tdContainer.addClass(pluginGlobal.dayStatus[6]);
                                    $extension.append(pluginGlobal._template.dayStatusIcon[6]);
                                } else {
                                    //$td.addClass('unselectable').addClass(pluginGlobal.dayStatus[requests[0].status]);
                                    //$tdContainer.addClass('unselectable').addClass(pluginGlobal.dayStatus[requests[0].status]);
                                    $td.addClass(pluginGlobal.dayStatus[requests[0].status]);
                                    $tdContainer.addClass(pluginGlobal.dayStatus[requests[0].status]);
                                    $extension.append(pluginGlobal._template.dayStatusIcon[requests[0].status]);
                                }
                            }
                        }
                        
                        if (pluginGlobal.isObjInArray(self.selectedDays, presentDate)) {
                            $tdContainer.addClass('nodecalendar-selected');
                        }

                        if (pluginGlobal.currentDate.getFullYear() == year
                        	&& pluginGlobal.currentDate.getMonth() == month
                        	&& pluginGlobal.currentDate.getDate() == dayLabel) {
                            dateText.addClass('today theme-button');
                        }
                        $tdContainer.append(dateText);
                        $tdContainer.append($extension);
                        $tdContainer.append(pluginGlobal._template.noteCalendarSelectedIcon);
                        $tdContainer.append($('<div class="td-hover-border">'));
                        $tdContainer.append($('<div class="td-selected-border">'));

                        $td.append($tdContainer);
                        $tr.append($td);

                        if (dayLabel === daysInMonth) {
                            dayLabel++;
                        }
                    }
                    $table.append($tr);
                }
                return $table;
            }
            function getRequestOnDay(date) {
                if (self.requestsDataToShow) {
                    var requests = [];
                    for (var i = 0, size = self.requestsDataToShow.length; i < size; i++) {
                        var duration = self.requestsDataToShow[i].duration;
                        var startDate = duration[0].substr(0, 10);
                        var endDate = duration[1].substr(0, 10);
                        if (date <= endDate && date >= startDate) {
                            var tdContainer = $('[data-real-date="' + date + '"]');
                            if (!tdContainer.hasClass('unselectable')) {
                                requests.push(self.requestsDataToShow[i]);
                            }
                        }
                    }
                    return requests;
                }
            }
        },

    });


    $.fn[pluginName] = function(options, args) {
        var result = [];
        this.each(function() {
            var self = $.data(this, 'plugin_' + pluginName);
            if (typeof options === 'string') {
                if (!self) {
                    window.console.error('Not initialized, can not call method : ' + options);
                }
                else if (!$.isFunction(self[options]) || options.charAt(0) === '_') {
                    window.console.error('No such method : ' + options);
                }
                else {
                    if (typeof args === 'string') {
                        args = [args];
                    }
                    self[options].apply(self, args);
                }
            }
            else {
                if (!self) {
                    result[result.length] = $.data(this, 'plugin_' + pluginName, new calendarview(this, $.extend(true, {}, options)));
                }
                else {
                    self._init(options);
                }
            }
        });
        return result;
    };

})(window.jQuery);