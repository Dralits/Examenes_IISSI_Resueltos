import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Button, Pressable } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { API_BASE_URL } from '@env'
import { postOrder } from '../../api/OrderEndpoints'
import { AuthorizationContext } from '../../context/AuthorizationContext'

export default function RestaurantDetailScreen ({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const { loggedInUser } = useContext(AuthorizationContext)
  const [order, setOrder] = useState([]);

  useEffect(() => {
    fetchRestaurantDetail()

  }, [route])

  const renderHeader = () => {
    return (
        <ImageBackground source={(restaurant?.heroImage) ? { uri: API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
            <Image style={styles.image} source={restaurant.logo ? { uri: API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
            <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
            <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
          </View>
        </ImageBackground>
    )
  }

  const incrementProduct = (product) => {
    setOrder((prevOrder) => {
      const existingProduct = prevOrder.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevOrder.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevOrder, { ...product, quantity: 1 }];
      }
    });
  };
  
  const decrementProduct = (product) => {
    setOrder((prevOrder) => {
      const existingProduct = prevOrder.find((item) => item.id === product.id);
      if (existingProduct) {
        if (existingProduct.quantity > 1) {
          return prevOrder.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
          );
        } else {
          return prevOrder.filter((item) => item.id !== product.id);
        }
      }
      return prevOrder;
    });
  };

  const confirmOrder = async () => {
    if (order.length === 0) return;
    if (!loggedInUser || !loggedInUser.address) {
      showMessage({
        message: 'Please set your delivery address in your profile first',
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      });
      return;
    } try {
        const orderData = {
        "restaurantId": restaurant.id,
        "address": loggedInUser.address, 
        "products": order.map(item => ({
          "productId": item.id,
          "quantity": item.quantity,
          "price": item.price
        })),
      };
      await postOrder(orderData);
      showMessage({
        message: 'Order created successfully!',
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      });
      setOrder([]);
    } catch (error) {
      showMessage({
        message: `Error creating order: ${error.response?.data?.message || error.message}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      });
    }
  };

  const cancelOrder = () => {
    if (order.length === 0) return;
    setOrder([]);
  };

  const renderProduct = ({ item }) => {
    const productInOrder = order.find(p => p.id === item.id);
    const quantity = productInOrder ? productInOrder.quantity : 0;
    return (
      <ImageCard
        imageUri={item.image ? { uri: API_BASE_URL + '/' + item.image } : undefined}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        
          { item.availability ?  (
            loggedInUser && (
            <View style={styles.quantityButtonsContainer}>
              <Pressable onPress={() => decrementProduct(item)} style={styles.quantityButton}>
                <TextRegular style={styles.symbol}>-</TextRegular>
              </Pressable>
              <Pressable onPress={() => incrementProduct(item)} style={styles.quantityButton}>
                <TextRegular style={styles.symbol}>+</TextRegular>
              </Pressable>
              <View style={styles.quantityDisplay}>
              <TextRegular>{quantity}</TextRegular>
              </View>
            </View>)
          ) : (
            <TextRegular textStyle={styles.availability}>Not available</TextRegular>
          )
        }
      </ImageCard>
    );
  };

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no products yet.
      </TextRegular>
    )
  }

  const fetchRestaurantDetail = async () => {
    try {
      const fetchedRestaurant = await getDetail(route.params.id)
      setRestaurant(fetchedRestaurant)
    } catch (error) {
        showMessage({
          message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
    }
  }
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyProductsList}
        style={styles.container}
        data={restaurant.products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
      />
      {/* Botones de confirmación y cancelación */}
      {loggedInUser && (
      <View style={styles.orderButtonsContainer}>
        <Pressable style={styles.confirmButton} onPress={() =>{
          confirmOrder()
          navigation.navigate("RestaurantsScreen")
        }}>
          <TextRegular textStyle={styles.orderButtonText}>✓ Confirm</TextRegular>
        </Pressable>
        <Pressable style={styles.cancelButton} onPress={() => {
          cancelOrder()
          navigation.navigate("RestaurantsScreen")
        }}>
          <TextRegular textStyle={styles.orderButtonText}>✖ Discard</TextRegular>
        </Pressable>
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  FRHeader: { 
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: GlobalStyles.brandSecondary
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  availability: {
    textAlign: 'right',
    marginRight: 5,
    color: GlobalStyles.brandSecondary
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%',
  },
  quantityButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: GlobalStyles.brandBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black' // O el color que prefieras
  },
  quantityDisplay: {
    marginLeft: 10,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'white'
  },
  confirmButton: {
    backgroundColor: GlobalStyles.brandSuccess,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: GlobalStyles.brandPrimary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  orderButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
})