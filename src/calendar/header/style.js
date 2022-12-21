import { StyleSheet, Platform } from "react-native";
import * as defaultStyle from "../../style";
import constants from "../../commons/constants";
import {Dimensions, PixelRatio} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const {height} = Dimensions.get('window');

const scale = SCREEN_WIDTH / 375;

const normalize = size => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export default function (theme = {}) {
  const appStyle = { ...defaultStyle, ...theme };
  const rtlStyle = constants.isRTL
    ? { transform: [{ scaleX: -1 }] }
    : undefined;
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      // paddingLeft: 10,
      // paddingRight: 10,
      // marginTop: 6,
    },
    partialHeader: {
      paddingHorizontal: 15,
    },
    headerContainer: {
      flexDirection: "row",
    },
    monthText: {
      fontSize: appStyle.textMonthFontSize,
      fontFamily: appStyle.textMonthFontFamily,
      fontWeight: appStyle.textMonthFontWeight,
      color: appStyle.monthTextColor,
      margin: 10,
    },
    arrow: {
      // padding: 10,
      ...appStyle.arrowStyle,
    },
    arrowImage: {
      ...rtlStyle,
      tintColor: appStyle.arrowColor,
      ...Platform.select({
        web: {
          width: appStyle.arrowWidth,
          height: appStyle.arrowHeight,
        },
      }),
    },
    disabledArrowImage: {
      ...rtlStyle,
      tintColor: appStyle.disabledArrowColor,
    },
    week: {
      // borderWidth: 1,
      marginTop: 37,
      flexDirection: "row",
      justifyContent: "space-around",
    },
    partialWeek: {
      paddingRight: 0,
    },
    dayHeader: {
      // borderWidth: 1,
      // marginTop: 2,
      marginBottom: 10,
      width: 32,
      textAlign: "center",
      fontSize: appStyle.textDayHeaderFontSize,
      fontFamily: appStyle.textDayHeaderFontFamily,
      fontWeight: appStyle.textDayHeaderFontWeight,
      color: appStyle.textSectionTitleColor,
    },
    disabledDayHeader: {
      color: appStyle.textSectionTitleDisabledColor,
    },
    // @ts-expect-error
    ...(theme["stylesheet.calendar.header"] || {}),
  });
}
