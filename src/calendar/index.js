import PropTypes from "prop-types";
import XDate from "xdate";
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
// @ts-expect-error
import GestureRecognizer, {
  swipeDirections,
} from "react-native-swipe-gestures";
import constants from "../commons/constants";
import { page, isGTE, isLTE, sameMonth } from "../dateutils";
import { xdateToData, parseDate, toMarkingFormat } from "../interface";
import { getState } from "../day-state-manager";
import { extractHeaderProps, extractDayProps } from "../componentUpdater";
import { useDidUpdate } from "../hooks";
import styleConstructor from "./style";
import CalendarHeader from "./header";
import Day from "./day/index";
import BasicDay from "./day/basic";
import {Dimensions, PixelRatio} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const {height} = Dimensions.get('window');

const scale = SCREEN_WIDTH / 375;

const normalize = size => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
/**
 * @description: Calendar component
 * @example: https://github.com/wix/react-native-calendars/blob/master/example/src/screens/calendars.js
 * @gif: https://github.com/wix/react-native-calendars/blob/master/demo/assets/calendar.gif
 */
const Calendar = (props) => {
  const {
    initialDate,
    current,
    theme,
    markedDates,
    minDate,
    maxDate,
    allowSelectionOutOfRange,
    onDayPress,
    onDayLongPress,
    onMonthChange,
    onVisibleMonthsChange,
    disableMonthChange,
    enableSwipeMonths,
    hideExtraDays,
    firstDay,
    showSixWeeks,
    displayLoadingIndicator,
    customHeader,
    headerStyle,
    accessibilityElementsHidden,
    importantForAccessibility,
    testID,
    style: propsStyle,
  } = props;
  const [currentMonth, setCurrentMonth] = useState(
    current || initialDate ? parseDate(current || initialDate) : new XDate()
  );
  const style = useRef(styleConstructor(theme));
  const header = useRef();
  const weekListRef = useRef();
  const weekNumberMarking = useRef({ disabled: true, disableTouchEvent: true });
  const [weeksData, setWeeksData] = useState();
  useEffect(() => {
    if (initialDate) {
      setCurrentMonth(parseDate(initialDate));
    }
  }, [initialDate]);
  useDidUpdate(() => {
    const _currentMonth = currentMonth.clone();
    onMonthChange?.(xdateToData(_currentMonth));
    onVisibleMonthsChange?.([xdateToData(_currentMonth)]);
  }, [currentMonth]);
  const updateMonth = useCallback(
    (newMonth) => {
      if (sameMonth(newMonth, currentMonth)) {
        return;
      }
      setCurrentMonth(newMonth);
    },
    [currentMonth]
  );
  const addMonth = useCallback(
    (count) => {
      console.log("currentMonth=>", currentMonth.clone());

      const newMonth = currentMonth.clone().addMonths(count, true);
      updateMonth(newMonth);
      return currentMonth;
    },
    [currentMonth, updateMonth]
  );
  // const addWeek = useCallback(
  //   (count) => {
  //     const newWeek = currentMonth.clone().addMonths(count, true);
  //     updateMonth(newMonth);
  //   },
  //   [currentMonth, updateMonth]
  // );
  const handleDayInteraction = useCallback(
    (date, interaction) => {
      const day = new XDate(date.dateString);
      if (
        allowSelectionOutOfRange ||
        (!(minDate && !isGTE(day, new XDate(minDate))) &&
          !(maxDate && !isLTE(day, new XDate(maxDate))))
      ) {
        if (!disableMonthChange) {
          updateMonth(day);
        }
        if (interaction) {
          interaction(date);
        }
      }
    },
    [
      minDate,
      maxDate,
      allowSelectionOutOfRange,
      disableMonthChange,
      updateMonth,
    ]
  );
  const _onDayPress = useCallback(
    (date) => {
      if (date) handleDayInteraction(date, onDayPress);
    },
    [handleDayInteraction, onDayPress]
  );
  const onLongPressDay = useCallback(
    (date) => {
      if (date) handleDayInteraction(date, onDayLongPress);
    },
    [handleDayInteraction, onDayLongPress]
  );
  const onSwipeLeft = useCallback(() => {
    // @ts-expect-error
    header.current?.onPressRight();
  }, [header]);
  const onSwipeRight = useCallback(() => {
    // @ts-expect-error
    header.current?.onPressLeft();
  }, [header]);
  const onSwipe = useCallback(
    (gestureName) => {
      const { SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT } = swipeDirections;
      switch (gestureName) {
        case SWIPE_UP:
        case SWIPE_DOWN:
          break;
        case SWIPE_LEFT:
          constants.isRTL ? onSwipeRight() : onSwipeLeft();
          break;
        case SWIPE_RIGHT:
          constants.isRTL ? onSwipeLeft() : onSwipeRight();
          break;
      }
    },
    [onSwipeLeft, onSwipeRight]
  );
  const renderWeekNumber = (weekNumber) => {
    return (
      <View
        style={style.current.dayContainer}
        key={`week-container-${weekNumber}`}
      >
        <BasicDay
          key={`week-${weekNumber}`}
          marking={weekNumberMarking.current}
          // state='disabled'
          theme={theme}
          testID={`${testID}.weekNumber_${weekNumber}`}
        >
          {weekNumber}
        </BasicDay>
      </View>
    );
  };
  const renderDay = (day, id) => {
    const dayProps = extractDayProps(props);
    if (!sameMonth(day, currentMonth) && hideExtraDays) {
      return <View key={id} style={style.current.emptyDayContainer} />;
    }
    const dateString = toMarkingFormat(day);
    return (
      <View style={style.current.dayContainer} key={id}>
        <Day
          {...dayProps}
          testID={`${testID}.day_${dateString}`}
          date={dateString}
          state={getState(day, currentMonth, props)}
          marking={markedDates?.[dateString]}
          onPress={_onDayPress}
          onLongPress={onLongPressDay}
        />
      </View>
    );
  };
  // ------------------------------------
  const renderWeek = (days, id) => {
    console.log("dayssss==>", days);
    const week = [];
    days.forEach((day, id2) => {
      week.push(renderDay(day, id2));
    }, this);
    if (props.showWeekNumbers) {
      week.unshift(renderWeekNumber(days[days.length - 1].getWeek()));
    }
    return (
      <View
        style={[style.current.week, { justifyContent: "flex-start" }]}
        key={id}
      >
        {week}
      </View>
    );
  };
  // --------------
  const renderMonth = () => {
    const shouldShowSixWeeks = showSixWeeks && !hideExtraDays;
    const days = page(currentMonth, firstDay, shouldShowSixWeeks);
    const weeks = [];
    while (days.length) {
      weeks.push(renderWeek(days.splice(0, 7), weeks.length));
    }
    return <View style={[style.current.monthView]}>{weeks}</View>;
    return (
      <FlatList
        ref={weekListRef}
        horizontal={true}
        data={weeks}
        // scrollEnabled={false}
        // contentContainerStyle={{
        //   borderWidth: 3,
        //   borderColor: "red",
        // }}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          // console.log("item==>", item);
          return (
            <Pressable
              onPress={() => {
                // weekListRef.current.scrollToIndex({
                //   animated: false,
                //   index: index + 1,
                // });
              }}
              style={[
                style.current.monthView,
                {
                  // borderWidth: 1,
                  // width: Dimensions.get("window").width,
                  // white: "gold",
                  marginRight: 10,
                  width: normalize(350),
                },
              ]}
            >
              {item}
            </Pressable>
          );
        }}
      />
    );
  };
  const shouldDisplayIndicator = useMemo(() => {
    if (currentMonth) {
      const lastMonthOfDay = toMarkingFormat(
        currentMonth.clone().addMonths(1, true).setDate(1).addDays(-1)
      );
      if (displayLoadingIndicator && !markedDates?.[lastMonthOfDay]) {
        return true;
      }
    }
    return false;
  }, [currentMonth, displayLoadingIndicator, markedDates]);
  const renderHeader = () => {
    const headerProps = extractHeaderProps(props);
    const ref = customHeader ? undefined : header;
    // const CustomHeader = customHeader;
    // const HeaderComponent = customHeader ? CustomHeader : CalendarHeader;
    if (customHeader) {
      return customHeader(
        currentMonth,
        () => {
          addMonth(-1);
        },
        () => {
          addMonth(1);
        }
      );
    }
    return (
      <CalendarHeader
        {...headerProps}
        testID={`${testID}.header`}
        style={headerStyle}
        ref={ref}
        month={currentMonth}
        addMonth={addMonth}
        weeks={weeksData}
        weekListRef={weekListRef.current}
        customHeader={customHeader}
        displayLoadingIndicator={shouldDisplayIndicator}
      />
    );
  };
  const GestureComponent = enableSwipeMonths ? GestureRecognizer : View;
  const swipeProps = {
    onSwipe: (direction) => onSwipe(direction),
  };
  const gestureProps = enableSwipeMonths ? swipeProps : undefined;
  return (
    <GestureComponent {...gestureProps}>
      <View
        style={[style.current.container, propsStyle]}
        testID={testID}
        accessibilityElementsHidden={accessibilityElementsHidden} // iOS
        importantForAccessibility={importantForAccessibility} // Android
      >
        {renderHeader()}
        {renderMonth()}
      </View>
    </GestureComponent>
  );
};
export default Calendar;
Calendar.displayName = "Calendar";
Calendar.propTypes = {
  ...CalendarHeader.propTypes,
  ...Day.propTypes,
  theme: PropTypes.object,
  firstDay: PropTypes.number,
  displayLoadingIndicator: PropTypes.bool,
  showWeekNumbers: PropTypes.bool,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.number,
  ]),
  current: PropTypes.string,
  initialDate: PropTypes.string,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
  markedDates: PropTypes.object,
  hideExtraDays: PropTypes.bool,
  showSixWeeks: PropTypes.bool,
  onDayPress: PropTypes.func,
  onDayLongPress: PropTypes.func,
  onMonthChange: PropTypes.func,
  onVisibleMonthsChange: PropTypes.func,
  disableMonthChange: PropTypes.bool,
  enableSwipeMonths: PropTypes.bool,
  disabledByDefault: PropTypes.bool,
  headerStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number,
    PropTypes.array,
  ]),
  customHeader: PropTypes.any,
  allowSelectionOutOfRange: PropTypes.bool,
};
