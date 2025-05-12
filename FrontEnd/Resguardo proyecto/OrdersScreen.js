import React, { useContext, useCallback, useState } from 'react'
import { StyleSheet, FlatList, View, Pressable } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { getAll, destroyOrder } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import { API_BASE_URL } from '@env'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import DeleteModal from '../../components/DeleteModal'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'

export default function OrdersScreen({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)
  const { loggedInUser } = useContext(AuthorizationContext)

  useFocusEffect(
    useCallback(() => {
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders(null)
    }
  }, [loggedInUser,route])
  )


  const fetchOrders = async () => {
    try {
      const fetchedOrders = await getAll()
      setOrders(fetchedOrders)

    } catch (error) {
      showMessage({
        message: `There was an error while retrieving orders. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle,
      })
    }
  }



  const renderOrder = ({ item: order }) => {
    return (
      <ImageCard
        imageUri={order.restaurant.logo ? { uri: `${API_BASE_URL}/${order.restaurant.logo}`} : restaurantLogo}
        title={order.restaurant.name}
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: order.id })
        }}
      >
        <TextSemiBold>
          Status:{' '}
          <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>
            {order.status}
          </TextSemiBold>
          </TextSemiBold>
          <TextSemiBold>
                    Price: {''}
                    <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>
                      {order.price.toFixed(2)}€
                    </TextSemiBold>
          </TextSemiBold>
          <TextSemiBold>
                    Address: {''}
                    <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>
                      {order.address}
                    </TextSemiBold>
          </TextSemiBold>
          {order.status === 'pending' && (
          <View style={styles.actionButtonsContainer}>
            <Pressable
              onPress={() => navigation.navigate('EditOrderScreen', { id: order.id })}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? GlobalStyles.brandBlueTap
                    : GlobalStyles.brandBlue
                },
                styles.actionButton
              ]}>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                <MaterialCommunityIcons name='pencil' color='white' size={20} />
                <TextRegular textStyle={styles.text}>Edit</TextRegular>
              </View>
            </Pressable>

            <Pressable
              onPress={() => { setOrderToBeDeleted(order) }}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? GlobalStyles.brandPrimaryTap
                    : GlobalStyles.brandPrimary
                },
                styles.actionButton
              ]}>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                <MaterialCommunityIcons name='delete' color='white' size={20} />
                <TextRegular textStyle={styles.text}>Delete</TextRegular>
              </View>
            </Pressable>
          </View>
        )}
      </ImageCard>
    )
  }

  const renderEmptyOrdersList = () => {
      return (
        <TextRegular textStyle={styles.emptyList}>
          No orders were retreived. Are you logged in?
        </TextRegular>
      )
    }


    const removeOrder = async (order) => {
      try {
        await destroyOrder(order.id)
        await fetchOrders()
        setOrderToBeDeleted(null)
        showMessage({
          message: `Order succesfully removed`,
          type: 'success',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      } catch (error) {
        console.log(error)
        setOrderToBeDeleted(null)
        showMessage({
          message: `Order could not be removed.`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }

    
  return (
    <>
    <FlatList
      style={styles.container}
      data={orders}
      renderItem={renderOrder}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={renderEmptyOrdersList}
    />
    <DeleteModal
          isVisible={orderToBeDeleted !== null}
          onCancel={() => setOrderToBeDeleted(null)}
          onConfirm={() => removeOrder(orderToBeDeleted)}>
        </DeleteModal>
        </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyList: {
    textAlign: 'center',
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
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
    width: '33%',
    alignSelf: 'flex-end'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
})