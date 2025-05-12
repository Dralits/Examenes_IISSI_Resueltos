/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable} from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { postOrder } from '../../api/OrderEndpoints'
import { getDetail } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { brandPrimary, brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles' //Importing classes as members to practise this importing style
import { API_BASE_URL } from '@env'
import { AuthorizationContext } from '../../context/AuthorizationContext'



export default function RestaurantDetailScreen ({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const [toOrder, setToOrder] = useState(new Map())
  const { loggedInUser } = useContext(AuthorizationContext)
  




  
  const incrementQuantity = (item) => {
    if (item.availability) {
      setToOrder((prev) => {
        const newMap = new Map(prev);
        const currentQuantity = newMap.get(item.id) || 0
        newMap.set(item.id, currentQuantity + 1)
        return newMap;
      })
    }
  }

  const decrementQuantity = (item) => {
    if (item.availability) {
      setToOrder((prev) => {
        const newMap = new Map(prev);
        const currentQuantity = newMap.get(item.id) || 0
        if (currentQuantity > 0) {
          newMap.set(item.id, currentQuantity - 1)
        }
        return newMap;
      })
    }
  }

  useEffect(() => {
    fetchRestaurantDetail()
  }, [route,loggedInUser])

  const renderHeader = () => {
    return (
      <View>
        <ImageBackground source={(restaurant?.heroImage) ? { uri: API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
            <Image style={styles.image} source={restaurant.logo ? { uri: API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
            <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
            <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
          </View>
        </ImageBackground>
      </View>
    )
  }

  
    

  const renderProduct = ({ item }) => {
    const quantity = toOrder.get(item.id) || 0 
    return (
      <ImageCard
        imageUri={item.image ? { uri: API_BASE_URL + '/' + item.image } : undefined}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        {!item.availability && (
          <TextRegular textStyle={styles.availability}>Not available</TextRegular>
        )}
        {item.availability && loggedInUser &&(
        <View style={styles.actionButtonsContainer2}>
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
          <TextRegular textStyle={styles.counterText}>{quantity}</TextRegular>
        </View>
        )}
      </ImageCard>
    )
  }

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
        style: flashStyle,
        titleStyle: flashTextStyle
      })
    }
  }

  const createThisOrder = async () => {
    try {

      const order = {
        "restaurantId": restaurant.id,
        "products": Array.from(toOrder.entries()).map(([id, quantity]) => ({
          productId: id,
          quantity: quantity,
        })),
        "address": loggedInUser.address
      } 

      const createdOrder = await postOrder(order)
      if (createdOrder) {
        showMessage({
          message: `Order created successfully`,
          type: 'success',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    } catch (error) {
      showMessage({
        message: `There was an error while creating order. ${error} `,
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
      ListEmptyComponent={renderEmptyProductsList}
      style={styles.container}
      data={restaurant.products}
      renderItem={renderProduct}
      keyExtractor={item => item.id.toString()} 
      />

      {loggedInUser && (
      <View style={styles.actionButtonsContainer3}>
        <Pressable
        onPress={() => {
          createThisOrder()
          navigation.navigate('RestaurantsScreen')
        }}
        style={({ pressed }) => [
          { backgroundColor: pressed
             ? GlobalStyles.brandGreenTap 
             : GlobalStyles.brandGreen 
          },
          styles.actionButton,
        ]}
        >
        <View style={styles.buttonContent}>
          <MaterialCommunityIcons name="check" color="white" size={20} />
          <TextRegular textStyle={styles.buttonText}>Confirm</TextRegular>
        </View>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('RestaurantsScreen')}
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
            <TextRegular textStyle={styles.buttonText}>Discard</TextRegular>
          </View>
        </Pressable>
      </View>
      )}
      </>     
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: brandSecondary
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
  counterText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
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
    color: brandSecondary
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
  }
  
})