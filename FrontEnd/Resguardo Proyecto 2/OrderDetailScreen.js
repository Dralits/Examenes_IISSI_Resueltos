/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { getDetail } from '../../api/OrderEndpoints'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../components/ImageCard'
import { API_BASE_URL } from '@env'


export default function OrderDetailScreen ({ navigation, route }) {
  const [order, setOrder] = useState({})
  

  useEffect(() => {
    fetchOrderDetail()
  }, [route])

  

  const renderProduct = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: API_BASE_URL + '/' + item.image } : undefined}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>

        <View style={styles.container2}>
          <TextSemiBold textStyle={styles.quantityText}>{item.OrderProducts.quantity}</TextSemiBold>
        </View>
      </ImageCard>
    )
  }

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <TextSemiBold textStyle={styles.headerTitle}>Order Details</TextSemiBold>
  
        <View style={styles.row}>
          <TextRegular textStyle={styles.label}>Status:</TextRegular>
          <TextRegular textStyle={styles.value}>{order.status}</TextRegular>
        </View>
  
        <View style={styles.row}>
          <TextRegular textStyle={styles.label}>Delivery Address:</TextRegular>
          <TextRegular textStyle={styles.value}>{order.address}</TextRegular>
        </View>
  
        <View style={styles.row}>
          <TextRegular textStyle={styles.label}>Shipping Costs:</TextRegular>
          <TextRegular textStyle={styles.value}>{order.shippingCosts}€</TextRegular>
        </View>
  
        <View style={styles.row}>
          <TextRegular textStyle={styles.label}>Total Price:</TextRegular>
          <TextSemiBold textStyle={[styles.value, styles.price]}>
            {order.price?.toFixed(2)}€
          </TextSemiBold>
        </View>
  
        <View style={styles.divider} />
  
        <View style={styles.row}>
          <TextRegular textStyle={styles.label}>Created At:</TextRegular>
          <TextRegular textStyle={styles.value}>{order.createdAt}</TextRegular>
        </View>
  
        <View style={styles.row}>
          <TextRegular textStyle={styles.label}>Started At:</TextRegular>
          <TextRegular textStyle={styles.value}>{order.startedAt}</TextRegular>
        </View>
  
        <View style={styles.row}>
          <TextRegular textStyle={styles.label}>Sent At:</TextRegular>
          <TextRegular textStyle={styles.value}>{order.sentAt}</TextRegular>
        </View>
  
        <View style={styles.row}>
          <TextRegular textStyle={styles.label}>Delivered At:</TextRegular>
          <TextRegular textStyle={styles.value}>{order.deliveredAt}</TextRegular>
        </View>
      </View>
    )
  }
  



  const fetchOrderDetail = async () => {
    try {
      const fetchedOrder = await getDetail(route.params.id)
      setOrder(fetchedOrder)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving order details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: flashStyle,
        titleStyle: flashTextStyle
      })
    }
  }

  return (
    <>
          <FlatList
          ListHeaderComponent={renderHeader}
          style={styles.container}
          data={order.products}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()} 
          />
    </>
  )
}

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
  },
  quantityText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  container2: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 12,
    marginRight: 12,
    padding: 8,
  },
 
  headerContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
     borderBottomWidth: 1,
     borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    marginBottom: 16,
    color: GlobalStyles.brandPrimary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    color: '#555',
  },
  price: {
    fontSize: 16,
    color: GlobalStyles.brandPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
  subHeader: {
    fontSize: 20,
    marginBottom: 8,
    color: GlobalStyles.brandPrimary,
  },


  
})
