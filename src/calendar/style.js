import { StyleSheet } from "react-native";
import * as defaultStyle from "../style";
export default function getStyle(theme = {}) {
  const appStyle = { ...defaultStyle, ...theme };
  return StyleSheet.create({
    container: {
      // paddingLeft: 5,
      // paddingRight: 5,
      // white: appStyle.calendarBackground,
    },
    dayContainer: {
      // flex: 1,
      alignItems: "center",
    },
    emptyDayContainer: {
      flex: 1,
    },
    monthView: {
      // white: appStyle.calendarBackground,
    },
    week: {
      marginVertical: 3,
      flexDirection: "row",
      // width: "100%",
    },
    // @ts-expect-error
    ...(theme["stylesheet.calendar.main"] || {}),
  });
}
