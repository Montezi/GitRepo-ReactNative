import React, { Component } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

const styles = StyleSheet.create({
  avatarOwner: {
    height: 42,
    width: 42,
    borderRadius: 21,
  },
  loading: {
    alignSelf: 'center',
    marginVertical: 20,
  },
});

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    visible: false,
    loading: false,
    page: 1,
    more: false,
    refreshing: false,
  };

  async componentDidMount() {
    const { visible } = this.state;
    setTimeout(() => this.setState({ visible: !visible }), 2500);
    this.loadStars();
  }

  loadStars = async (page = 1) => {
    const { navigation } = this.props;
    const { stars } = this.state;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred?page=${page}`);

    this.setState({
      stars: page >= 2 ? [...stars, ...response.data] : response.data,
      page,
      loading: false,
      more: response.headers.link && response.headers.link.includes('next'),
      refreshing: false,
    });
  };

  loadMore = () => {
    const { page, more } = this.state;

    if (more) {
      this.setState({ loading: true });
      this.loadStars(page + 1);
    }
  };

  renderFooter = () => {
    const { loading } = this.state;
    if (!loading) return null;
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  };

  refreshList = () => {
    this.setState({ refreshing: true });
    this.loadStars();
  };

  handleNavigate = repository => {
    const { navigation } = this.props;
    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, visible, refreshing } = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        <Stars
          data={stars}
          keyExtractor={star => String(star.id)}
          onEndReached={this.loadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={this.renderFooter}
          onRefresh={this.refreshList}
          refreshing={refreshing}
          renderItem={({ item }) => (
            <Starred onPress={() => this.handleNavigate(item)}>
              <ShimmerPlaceHolder
                style={styles.avatarOwner}
                autoRun
                visible={visible}
              >
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
              </ShimmerPlaceHolder>
              <Info>
                <ShimmerPlaceHolder autoRun visible={visible}>
                  <Title>{item.name}</Title>
                </ShimmerPlaceHolder>
                <ShimmerPlaceHolder autoRun visible={visible}>
                  <Author>{item.owner.login}</Author>
                </ShimmerPlaceHolder>
              </Info>
            </Starred>
          )}
        />
      </Container>
    );
  }
}
