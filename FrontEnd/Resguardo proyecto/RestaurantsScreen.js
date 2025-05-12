//Done

/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image } from 'react-native'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import { getRestaurants } from '../../api/RestaurantEndpoints'
import { getProductPopular } from '../../api/ProductEndpoints'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import ImageCard from '../../components/ImageCard'
import { API_BASE_URL } from '@env'
import * as GlobalStyles from '../../styles/GlobalStyles'

export default function RestaurantsScreen({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])
  const [popularProducts, setPopularProducts] = useState([])
  
  useEffect(() => {
    fetchRestaurants()
  }, [route])

  const fetchRestaurants = async () => {
    try {
      const fetchedRestaurants = await getRestaurants()
      setRestaurants(fetchedRestaurants)

      const fetchedPopularProducts = await getProductPopular()
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
        <TextSemiBold style={styles.topProducts}>Top Products Overall:</TextSemiBold>
        
        {Array.isArray(popularProducts) && popularProducts.length > 0 ? (
          <View style={styles.productsContainer}>
            {popularProducts.map((product, index) => (
            <View key={index} style={styles.productCard}>
                <ImageCard
                  imageUri={product.image ? { uri: API_BASE_URL + '/' + product.image } : restaurantLogo}
                  title={product.name}
                  onPress={() => {
                    navigation.navigate('RestaurantDetailScreen', { id: product.restaurantId });
                  }}
                >
                  <TextRegular numberOfLines={2}>{product.description}</TextRegular>
                </ImageCard>  
            </View>
            ))}
          </View>
        ) : (
          <TextSemiBold>No popular products available</TextSemiBold>
        )}
      </View>
    );
  };
  
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
    flex: 1
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  productHeaderContainer: {
    height: 200,
    padding: 20,
    flex: 1,
    backgroundColor: 'rgba(rgb(190, 15, 46)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  productsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    alignItems: 'center',
    width: '100%',
    marginTop: 10,

  },
  productCard: {
    width: '30%', 
    borderRadius: 12, 
    overflow: 'hidden',
    backgroundColor: '#fff', 
    
  },
  topProducts: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10
  },
})
