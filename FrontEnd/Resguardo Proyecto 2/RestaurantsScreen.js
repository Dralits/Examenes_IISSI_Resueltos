/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image } from 'react-native'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import { getAllUnauth } from '../../api/RestaurantEndpoints'
import { getPopularPoducts } from '../../api/ProductEndpoints'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import ImageCard from '../../components/ImageCard'
import { API_BASE_URL } from '@env'
import * as GlobalStyles from '../../styles/GlobalStyles'

export default function RestaurantsScreen({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])
  const [popularProducts, setPopularProducts] = useState({})
  
  useEffect(() => {
    fetchRestaurants()
  }, [route])

  const fetchRestaurants = async () => {
    try {
      const fetchedRestaurants = await getAllUnauth()
      setRestaurants(fetchedRestaurants)

      const fetchedPopularProducts = await getPopularPoducts()
      setPopularProducts(fetchedPopularProducts)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurants. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  
  const renderRestaurant = ({ item }) => {
    return (
    
      <ImageCard
        imageUri={item.logo ? { uri: API_BASE_URL + '/' + item.logo } : restaurantLogo}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>

        {item.averageServiceMinutes !== null && (
          <TextSemiBold>
            Avg. service time: 
            <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>
              {item.averageServiceMinutes} min.
            </TextSemiBold>
          </TextSemiBold>
        )}

        <TextSemiBold>
          Shipping: 
          <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>
            {item.shippingCosts.toFixed(2)}€
          </TextSemiBold>
        </TextSemiBold>
      </ImageCard>
    )
  }

  const renderEmptyRestaurantsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No restaurants were retrieved.
      </TextRegular>
    )
  }

  const renderHeader = () => {
    return (
      <View style={styles.productHeaderContainer}>
        <TextSemiBold style={styles.topProducts}>Most Popular Products</TextSemiBold>
        {Array.isArray(popularProducts) && popularProducts.length > 0 ? (
          <View style={styles.productsContainer}>
            {popularProducts.map((product, index) => (
              <View key={index} style={styles.productBox}>
                <ImageCard
                  imageUri={product.image ? { uri: `${API_BASE_URL}/${product.image}` } : restaurantLogo}
                  title={product.name}
                  onPress={() => {
                    navigation.navigate('RestaurantDetailScreen', { id: product.restaurantId })
                  }}
                  style={styles.productCard}
                >
                  <TextRegular numberOfLines={2} textStyle={styles.productDescription}>
                    {product.description}
                  </TextRegular>
                </ImageCard>
              </View>
            ))}
          </View>
        ) : (
          <TextSemiBold style={styles.noProducts}>No popular products available</TextSemiBold>
        )}
      </View>
    )
  }
  
  
  
  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      style={styles.container}
      data={restaurants}
      renderItem={renderRestaurant}
      keyExtractor={item => item.id.toString()}
      ListEmptyComponent={renderEmptyRestaurantsList}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(190, 15, 46, 0.9)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  productsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  productBox: {
    width: '30%', 
    borderRadius: 12, 
    overflow: 'hidden',
    backgroundColor: '#fff', 
  },
  productCard: {
    width: '100%', 
    height: 150, 
  },
  productDescription: {
    fontSize: 12,
    color: '#333',
    padding: 4, 
  },
  topProducts: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noProducts: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
})

