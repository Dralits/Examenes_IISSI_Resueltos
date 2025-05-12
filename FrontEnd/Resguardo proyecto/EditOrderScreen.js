//Done

/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, Pressable } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { getDetail } from '../../api/OrderEndpoints'
import { getRestaurantProducts } from '../../api/RestaurantEndpoints'
import { showMessage } from 'react-native-flash-message'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import ImageCard from '../../components/ImageCard'
import { putOrder } from '../../api/OrderEndpoints'
import { API_BASE_URL } from '@env'
import {  Formik } from 'formik'
import InputItem from '../../components/InputItem'

export default function EditOrderScreen ({ navigation, route }) {
  const [order, setOrder] = useState({})
  const [quantities, setQuantities] = useState(new Map())
  const [products, setProducts] = useState([])
  const [address, setAddress] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)


  useEffect(() => {
    fetchOrderDetail()
  }, [route])

  useEffect(() => {
    calculateTotalPrice()
  }, [quantities, products])
  

  const incrementQuantity = (item) => {
    setQuantities((prev) => {
      const newMap = new Map(prev)
      const currentQuantity = newMap.get(item.id) || 0
      newMap.set(item.id, currentQuantity + 1)
      return newMap
    })
  }
  
  const decrementQuantity = (item) => {
    setQuantities((prev) => {
      const newMap = new Map(prev)
      const currentQuantity = newMap.get(item.id) || 0
      if (currentQuantity > 0) {
        newMap.set(item.id, currentQuantity - 1)
      }
      return newMap
    })
  }
  
  const calculateTotalPrice = () => {
    let productTotal = 0
    products.forEach(product => {
      const quantity = quantities.get(product.id) || 0
      productTotal += product.price * quantity
    })

    setTotalPrice(productTotal + order.shippingCosts)
  }
  

  const renderProduct = ({ item }) => {
    const quantity = quantities.get(item.id) || 0
    return (
      <ImageCard
        imageUri={item.image ? { uri: API_BASE_URL + '/' + item.image } : undefined}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>

        <View style={styles.actionButtonsContainer2}>
          <TextRegular textStyle={styles.counterText}>{quantity}</TextRegular>
          <Pressable
            onPress={() => { incrementQuantity(item) }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandBlueTap
                  : GlobalStyles.brandBlue,
              },
              styles.actionButton2,
            ]}
          >
            <MaterialCommunityIcons name="plus" color="white" size={20} />
          </Pressable>
          <Pressable
            onPress={() => { decrementQuantity(item) }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandBlueTap
                  : GlobalStyles.brandBlue,
              },
              styles.actionButton2,
            ]}
          >
            <MaterialCommunityIcons name="minus" color="white" size={20} />
          </Pressable>
          
        </View>
      </ImageCard>
    )
  }

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
  
      <View style={styles.row}>
          <TextRegular textStyle={styles.label}>Address: </TextRegular>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <Formik
            initialValues={{ address }}
            onSubmit={(values) => {
              setAddress(values.address) // Actualiza la dirección en el estado
            }}
          >
            {({ handleChange, handleSubmit, values }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <InputItem
                  name="address"
                  label="Address"
                />
                <Pressable
           onPress={handleSubmit}
          style={({ pressed }) => [
          {
            backgroundColor: pressed
            ? GlobalStyles.brandSuccessTap
            : GlobalStyles.brandSuccess
          },
            styles.button
            ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='content-save' color={'white'} size={20}/>
            <TextRegular textStyle={styles.text}>
              Save
            </TextRegular>
            </View>
            </Pressable>
         </View>
            )}
          </Formik>
          </View>
        </View>
  
        <View style={styles.row}>
          <TextRegular textStyle={styles.label}>Shipping Costs:</TextRegular>
          <TextRegular textStyle={styles.value}>{order.shippingCosts}€</TextRegular>
        </View>
        <View style={styles.row}>
          <TextRegular textStyle={styles.label}>Products Price:</TextRegular>
          <TextRegular textStyle={styles.value}>{totalPrice.toFixed(2)-order.shippingCosts}€</TextRegular>
        </View>
  
        <View style={styles.row}>
          <TextRegular textStyle={styles.label}>Total Price:</TextRegular>
          <TextSemiBold textStyle={[styles.value, styles.price]}>
            {totalPrice.toFixed(2)}€
          </TextSemiBold>

        </View>
  
        <View style={styles.divider} />
  
        <View style={styles.row}>
          <TextRegular textStyle={styles.label}>Created At:</TextRegular>
          <TextRegular textStyle={styles.value}>{order.createdAt}</TextRegular>
          
        </View>
      </View>
    )
  }
  

  const updateThisOrder = async () => { 
    try {
      const { restaurantId, ...restOfOrder } = order
      const updatedOrder = {
        ...restOfOrder,
        products: Array.from(quantities.entries()).map(([productId, quantity]) => ({
          productId,
          quantity,
        })),
        address: address,
        price: totalPrice 
      }
  
      const response = await putOrder(route.params.id, updatedOrder)
      if (response) {
        showMessage({
          message: `Order updated successfully`,
          type: 'success',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    } catch (error) {
      showMessage({
        message: `There was an error while updating the order. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  

  const fetchOrderDetail = async () => {
    try {
      const fetchedOrder = await getDetail(route.params.id)
      setOrder(fetchedOrder)
      setAddress(fetchedOrder.address)
  
      // Extrae las cantidades desde la orden original
      const quantityMap = new Map(fetchedOrder.products.map(product => [
        product.id,
        product.OrderProducts.quantity
      ]))
      setQuantities(quantityMap)
  
      // Obtiene todos los productos del restaurante
      const restaurantProducts = await getRestaurantProducts(fetchedOrder.restaurantId)
      setProducts(restaurantProducts)
  
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving order details. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  

  return (
    <>
      <FlatList
        ListHeaderComponent={renderHeader}
        style={styles.container}
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()} 
      />
      <View style={styles.actionButtonsContainer3}>
        <Pressable
          onPress={async () => {navigation.navigate('OrdersScreen'), updateThisOrder()}}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandGreenTap
                : GlobalStyles.brandGreen,
            },
            styles.actionButton,
          ]}
        >
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons name="check" color="white" size={20} />
            <TextRegular textStyle={styles.buttonText}>Save changes</TextRegular>
          </View>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('OrdersScreen')}
          style={({ pressed }) => [
          {
          backgroundColor: pressed
            ? GlobalStyles.brandPrimaryTap
            : GlobalStyles.brandPrimary,
          },
          styles.actionButton,
          ]}
         >
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons name="close" color="white" size={20} />
            <TextRegular textStyle={styles.buttonText}>Discard changes</TextRegular>
          </View>
        </Pressable>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#555',
    flex: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 5,
    flex: 2,
  },
  editButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%',
    minWidth: 120
  },
  actionButton2: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  actionButtonsContainer2: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonsContainer3: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
    width: '96%' 
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8, 
  },
  counterText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  price: {
    fontSize: 16,
    color: GlobalStyles.brandPrimary,
  },
});