/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, Pressable, TextInput } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { getDetail } from '../../api/OrderEndpoints'
import { showMessage } from 'react-native-flash-message'
import { MaterialCommunityIcons } from '@expo/vector-icons' 
import ImageCard from '../../components/ImageCard'
import { updateOrder } from '../../api/OrderEndpoints'
import { getDetail as getRestaurantDetail } from '../../api/RestaurantEndpoints'
import { API_BASE_URL } from '@env'


export default function EditOrderScreen ({ navigation, route }) {
  const [order, setOrder] = useState({})
  const [products, setProducts] = useState(new Map())
  const [address, setAddress] = useState('')
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [addedPrice, setAddedPrice] = useState(0)

  useEffect(() => {
    fetchOrderDetail()
  }, [route])

  const incrementQuantity = (item) => {
    
      setProducts((prev) => {
        const newMap = new Map(prev);
        const currentQuantity = newMap.get(item.id) || 0
        newMap.set(item.id, currentQuantity + 1)
        return newMap;
      })
    
  }

  const decrementQuantity = (item) => {
    
      setProducts((prev) => {
        const newMap = new Map(prev);
        const currentQuantity = newMap.get(item.id) || 0
        if (currentQuantity > 0) {
          newMap.set(item.id, currentQuantity - 1)
        }
        return newMap;
      })
    
  }

  const renderProduct = ({ item }) => {
    const quantity = products.get(item.id) || 0
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
            onPress={() => { 
              incrementQuantity(item);
              setAddedPrice((prev) => prev + item.price); 
            }}
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
            onPress={() => { decrementQuantity(item);
              setAddedPrice((prev) => prev - item.price);
             }}
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
        <TextSemiBold textStyle={styles.headerTitle}>Order Details</TextSemiBold>
  
        <View style={styles.row}>
          <TextRegular textStyle={styles.label}>Status:</TextRegular>
          <TextRegular textStyle={styles.value}>{order.status}</TextRegular>
        </View>
  
        <View style={styles.row}>
        <TextRegular textStyle={styles.label}>Delivery Address: </TextRegular>
          
          {isEditingAddress ? (
            <TextInput
            style={styles.textInput}
            value={address}
            onChangeText={setAddress}
            autoFocus 
          />

          ) : (
            <TextRegular textStyle={styles.value}>{address}</TextRegular>
          )}
          
          <Pressable
            onPress={() => setIsEditingAddress((prev) => !prev)}
            style={({ pressed }) => [
              { 
                backgroundColor: isEditingAddress
                  ? (pressed ? GlobalStyles.brandGreenTap : GlobalStyles.brandGreen)
                  : (pressed ? GlobalStyles.brandBlueTap : GlobalStyles.brandBlue),
              },
              styles.editButton,
            ]}
            >
            <MaterialCommunityIcons
              name={isEditingAddress ? 'check' : 'pencil'}
              color="white"
              size={20}
            />
          </Pressable>
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
  

  const updateThisOrder = async () => { 
    try {
      const { restaurantId, ...restOfOrder } = order
      const updatedOrder = {
        ...restOfOrder,
        products: Array.from(products.entries()).filter(item => item[1] > 0).map(([productId, quantity]) => ({
          productId: productId,
          quantity: quantity,
        })), 
        address: address,
        price: order.price + addedPrice,
      }
      const response = await updateOrder(route.params.id, updatedOrder)
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
      const fetchedRetsaurant = await getRestaurantDetail(fetchedOrder.restaurantId)
      let productsMap = new Map(fetchedOrder.products.map(product => [product.id, product.OrderProducts.quantity]))

      fetchedRetsaurant.products.forEach(product => { !productsMap.has(product.id) ? productsMap.set(product.id, 0) : null })

      const fetchedOrderWithAllProducts = {
        ...fetchedOrder,
        products: fetchedRetsaurant.products.map(product => ({
          ...product,
          quantity: productsMap.get(product.id) || 0,
        })),
      }

      setOrder(fetchedOrderWithAllProducts)
      setProducts(productsMap)
      setAddress(fetchedOrder.address)
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
})