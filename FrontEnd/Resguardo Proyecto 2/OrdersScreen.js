import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, FlatList, View, Pressable } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import DeleteModal from '../../components/DeleteModal'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { getAll, removeOrder } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import { API_BASE_URL } from '@env'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import * as GlobalStyles from '../../styles/GlobalStyles'

export default function OrdersScreen({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders(null)
    }
  }, [loggedInUser,route])

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
        imageUri={order.restaurant.logo ? { uri: `${API_BASE_URL}/${order.restaurant.logo}` } : restaurantLogo}
        title={order.restaurant.name}
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: order.id })
        }}
      >
        <TextSemiBold>
          Status:{' '}
          <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary, fontSize: 18, marginBottom: 8 }}>
            {order.status}
          </TextSemiBold>
        </TextSemiBold>
        {order.status === 'pending' && (
        <View style={styles.actionButtonsContainer}>
          <Pressable
            onPress={() => navigation.navigate('EditOrderScreen', { id: order.id })
            }
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandBlueTap
                  : GlobalStyles.brandBlue
              },
              styles.actionButton
            ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='pencil' color={'white'} size={20}/>
            <TextRegular textStyle={styles.text}>
              Edit Order
            </TextRegular>
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
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='delete' color={'white'} size={20}/>
            <TextRegular textStyle={styles.text}>
              Cancel Order
            </TextRegular>
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
        {loggedInUser
          ? 'You have no orders yet. Go to the restaurants tab to place an order.'
          : 'You have no orders yet. Log in to see your orders.'}
      </TextRegular>
    )
  }

  const removeThisOrder = async (order) => {
    try {
      await removeOrder(order.id)
      setOrders(orders.filter((o) => o.id !== order.id))
      showMessage({
        message: `Order ${order.id} was successfully deleted.`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle,
      })
    } catch (error) {
      showMessage({
        message: `There was an error while deleting the order. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle,
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
          onConfirm={() => {
            removeThisOrder(orderToBeDeleted)
            setOrderToBeDeleted(null)
            }
          }>
            <TextRegular>
              Are you sure you want to delete this order?
            </TextRegular>
      </DeleteModal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignSelf: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    width: '90%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
