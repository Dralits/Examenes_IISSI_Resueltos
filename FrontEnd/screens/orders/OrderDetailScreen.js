/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles' //Importing classes as members to practise this importing style
import { API_BASE_URL } from '@env'

export default function OrderDetailScreen ({ navigation, route }) {
  const [order, setOrder] = useState({})

  useEffect(() => {
      fetchOrderDetail()
  }, [route])

  const fetchOrderDetail = async () => {
    try {
      const fetchedOrder = await getDetail(route.params.id)
      setOrder(fetchedOrder)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving orders details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderHeader = () => {
    return (
      <View>
        <View style={styles.orderHeaderContainer}>
          {order.createdAt && (
            <TextRegular textStyle={styles.description}>
              Created At:{" "}
              <TextRegular textStyle={styles.date}>
                {new Date(order.createdAt).getDate()}/
                {new Date(order.createdAt).getMonth() + 1}/
                {new Date(order.createdAt).getFullYear()}{" "}
                {new Date(order.createdAt).getHours()}:
                {new Date(order.createdAt).getMinutes().toString().padStart(2, '0')}:
                {new Date(order.createdAt).getSeconds()}
              </TextRegular>
            </TextRegular>
          )}
          {order.startedAt && (
            <TextRegular textStyle={styles.description}>
              Started At:{" "}
              <TextRegular textStyle={styles.date}>
                {new Date(order.startedAt).getDate()}/
                {new Date(order.startedAt).getMonth() + 1}/
                {new Date(order.startedAt).getFullYear()}{" "}
                {new Date(order.startedAt).getHours()}:
                {new Date(order.startedAt).getMinutes().toString().padStart(2, '0')}:
                {new Date(order.startedAt).getSeconds()}
              </TextRegular>
            </TextRegular>
          )}
          {order.sentAt && (
            <TextRegular textStyle={styles.description}>
              Sent At:{" "}
              <TextRegular textStyle={styles.date}>
                {new Date(order.sentAt).getDate()}/
                {new Date(order.sentAt).getMonth() + 1}/
                {new Date(order.sentAt).getFullYear()}{" "}
                {new Date(order.sentAt).getHours()}:
                {new Date(order.sentAt).getMinutes().toString().padStart(2, '0')}:
                {new Date(order.sentAt).getSeconds()}
              </TextRegular>
            </TextRegular>
          )}
          {order.deliveredAt && (
            <TextRegular textStyle={styles.description}>
              Delivered At:{" "}
              <TextRegular textStyle={styles.date}>
                {new Date(order.deliveredAt).getDate()}/
                {new Date(order.deliveredAt).getMonth() + 1}/
                {new Date(order.deliveredAt).getFullYear()}{" "}
                {new Date(order.deliveredAt).getHours()}:
                {new Date(order.deliveredAt).getMinutes().toString().padStart(2, '0')}:
                {new Date(order.deliveredAt).getSeconds()}
              </TextRegular>
            </TextRegular>
          )}
          <TextRegular textStyle={styles.description}>
            {"\n"}Address: {order.address}
          </TextRegular>
          <TextRegular textStyle={styles.description}>
            {"\n"}Shipping Cost: {order.shippingCosts}€
          </TextRegular>
          <TextSemiBold textStyle={styles.price}>
            Total price: {order.price}€
          </TextSemiBold>
          <TextSemiBold textStyle={styles.status}>
            {"\n"}{order.status}
          </TextSemiBold>
        </View>
      </View>
    )
  }
  
  const renderProduct = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: API_BASE_URL + '/' + item.image } : undefined}
        title={item.name}
      >
        <TextRegular>{`UnityPrice: $${item.price}`}</TextRegular> {/* Muestra el precio del producto */}
        <TextRegular>Quantity: {item.OrderProducts.quantity}</TextRegular>


      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This Order has no products yet.
      </TextRegular>
    )
  }

  return (
      <FlatList
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyProductsList}
        style={styles.container}
        data={order.products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
      />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  price: {
    fontSize: 16, 
    fontWeight: 'bold',
    color: '#000',
  },
  emptyList: {
    textAlign: 'center',
    color: '#999',
  },
  orderHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(rgb(190, 15, 46)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  description: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  status: {
    color: 'white',
    fontSize: 24
  },
  date: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold'
  }
})
