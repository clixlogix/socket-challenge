import React, { Component } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, FlatList, Platform, StyleSheet } from 'react-native';
import moments from 'moment';
import io from 'socket.io-client';

const userName = 'Clixlogix';
const serverUrl = 'https://websocket-challenge.herokuapp.com/chat';
const commonColor = "#ccc";

export default class App extends Component {

  state = {
    socketConnectionSatus: 'Connecting',
    onMessageReceive: []
  }

  render() {
    return (
      <SafeAreaView style={styles.flex}>
        {/* View function to render connection status header */}
        {this.renderConnectionHeader()}

        {/* View function to render two button for Hello world and random number */}
        {this.renderTopButton()}

        {/* View function to render list of message come from socket */}
        {this.renderFlatList()}
      </SafeAreaView>
    );

  }

  componentDidMount() {
    this.socket = io(serverUrl, { transports: ['websocket'] });

    /**
     * Use to connect user with Socket server.
     */
    this.socket.on('connect', () => {
      this.setState({ socketConnectionSatus: 'Connected' })
      this.socket.emit("join", { 'room': userName });
    });

    /**
     * Use to disconnect user from Socket server.
     */
    this.socket.on('disconnect', () => {
      this.setState({ socketConnectionSatus: 'Disconnected' });
    });

    /**
     * listerner to receive new message.
     */
    this.socket.on('new_message', data => {
      if (!data.room) {
        const object = {
          message: data.message,
          time: moments().format('h:mm a')
        }
        this.setState({ onMessageReceive: this.state.onMessageReceive.concat(object) })
      }
    });

  }

  /*********************** View functions ****************************/

  /**
   * function to render connection status header.
   */
  renderConnectionHeader = () => {
    return <View style={styles.statusHeaderView}>
      <View style={styles.inRow}>
        <View style={[styles.colorStatus, { backgroundColor: this.colorFromStatus() }]} />
        <Text style={{ marginLeft: 8 }}>{this.state.socketConnectionSatus}</Text>
      </View>
    </View>
  }

  /**
   * function to render two button for Hello world and random number.
   */
  renderTopButton = () => {
    return <View style={[styles.inRow, styles.inCenter, styles.buttonView]}>
      <TouchableOpacity
        onPress={() => this.emitEvent('hello_world')}
        style={[styles.inCenter, styles.button]}>
        <Text>Hello world</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => this.emitEvent('random_number')}
        style={[styles.inCenter, styles.button, { marginLeft: 16 }]}>
        <Text>Random Number</Text>
      </TouchableOpacity>
    </View>
  }

  /**
   * function to render list of message come from socket.
   */
  renderFlatList = () => {
    return <View style={[styles.flex, { padding: 16 }]}>
      <FlatList
        ref={ref => this.listScroll = ref}
        onContentSizeChange={() => this.listScroll.scrollToEnd({ animated: true })}
        data={this.state.onMessageReceive}
        keyExtractor={(item, index) => `${item}-${index}`}
        ListEmptyComponent={this.emptyResult}
        renderItem={({ item }) => <View style={styles.renderItem}>
          <Text style={{ fontSize: 18 }}>{item.message}</Text>
          <View style={styles.messageTime}>
            <Text style={{ fontSize: 14 }}>{item.time}</Text>
          </View>
        </View>
        }
      />
    </View>
  }

  /**
   * function call while message list is empty.
   */
  emptyResult = () => {
    return <View style={[styles.flex, styles.inCenter]}>
      <Text style={{ fontSize: 16 }}>No data</Text>
    </View>
  }

  /*********************** Other functions ****************************/

  /**
   * function to change connection status color.
   */
  colorFromStatus = () => {
    let { socketConnectionSatus } = this.state;
    switch (socketConnectionSatus) {
      case 'Connecting':
        return 'yellow'

      case 'Connected':
        return 'green'

      case 'Disconnected':
        return 'red'
    }
  }

  /**
   * function to emit event to socket.
   */
  emitEvent = (event) => {
    this.socket.emit(event, { 'room': userName });
  }

}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  inRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  inCenter: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusHeaderView: {
    height: 56,
    padding: 16,
    backgroundColor: commonColor,
    marginTop: Platform.OS === 'android' ? 24 : 0
  },
  colorStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  buttonView: {
    padding: 16,
    borderBottomColor: commonColor,
    borderBottomWidth: 1
  },
  button: {
    borderColor: commonColor,
    padding: 8,
    borderWidth: 1,
    borderRadius: 4
  },
  renderItem: {
    width: 160,
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
    backgroundColor: commonColor
  },
  messageTime: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginTop: 4
  }
})