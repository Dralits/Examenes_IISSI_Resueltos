import React,{ useContext,useState,useCallback} from 'react'
import { StyleSheet, View, Pressable,FlatList, ScrollView } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { getAll, getDetail, deleteOrder} from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import { API_BASE_URL } from '@env'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import DeleteModal from '../../components/DeleteModal'
import { useFocusEffect } from '@react-navigation/native'


export default function OrdersScreen ({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)
  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)

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
        message: `There was an error while retrieving the orders. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const removeOrder = async (item) => {
    try {
      await deleteOrder(item.id)
      await fetchOrders()
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order ${item.id} succesfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order ${item.id} could not be removed.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderOrderItem = ({ item }) => {
    return(
      <ImageCard
        imageUri={item.restaurant.logo ? { uri: API_BASE_URL + '/' + item.restaurant.logo } : restaurantLogo}
        title={item.restaurant.name}
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: item.id })
        }}
        style={styles.orderCard}
      >
      <TextSemiBold>
        Status:{' '}
        <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>
          {item.status}
        </TextSemiBold>
      </TextSemiBold>
      <TextSemiBold>
        Price: {''}
        <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>
          {item.price.toFixed(2)}€
        </TextSemiBold>
      </TextSemiBold>
      <TextSemiBold>
        Address: {''}
        <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>
          {item.address}
        </TextSemiBold>
      </TextSemiBold>
      {item.status === 'pending' && ( // Solo muestra el botón si el estado es "pending"
        <View style={styles.actionButtonsContainer}>
          <Pressable
            onPress={() => navigation.navigate('EditOrderScreen', { id: item.id })}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? GlobalStyles.brandBlueTap : GlobalStyles.brandBlue
              },
              styles.actionButton
              ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='pencil' color={'white'} size={20} />
              <TextRegular textStyle={styles.text}> Edit </TextRegular>
            </View>
          </Pressable>
          <Pressable
            onPress={() => setOrderToBeDeleted(item)}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? GlobalStyles.brandPrimaryTap : GlobalStyles.brandPrimary,
              },
              styles.actionButton,
            ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name="delete" color={'white'} size={20} />
              <TextRegular textStyle={styles.text}> Delete </TextRegular>
            </View>
          </Pressable>
        </View>
        )}
      </ImageCard>
    )
  }

  const renderEmptyRestaurantsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No restaurants were retreived. Are you logged in?
      </TextRegular>
    )
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          ListEmptyComponent={renderEmptyRestaurantsList}
        />
      </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'stretch',
    width: '100%',
  },
  button: {
    borderRadius: 8,
    height: 100,
    margin: 12,
    padding: 10,
    width: '100%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  },
  orderCard: {
    flexDirection: 'row', // Alinea los elementos en fila
    color: '#ffbfbf',
    backgroundColor: '#b6c5d4', // Fondo claro
    borderRadius: 8,
    padding: 16,
    marginVertical: 0,
    flex: 1, // Ocupa todo el ancho disponible
    alignSelf: 'center', // Asegura que se estire al ancho del contenedor  
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
  },  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '33%',
    alignSelf: 'flex-end'
  },

})
