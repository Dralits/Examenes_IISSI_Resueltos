/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'

export default function OrderDetailScreen ({ navigation, route }) {
  useEffect(() => {

  }, [route])

  return (
    <View style={styles.container}>
      <View style={styles.FRHeader}>
        <TextSemiBold>FR6: Show order details</TextSemiBold>
        <TextRegular>A customer will be able to look his/her orders up. The system should provide all details of an order, including the ordered products and their prices.</TextRegular>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  }
})
