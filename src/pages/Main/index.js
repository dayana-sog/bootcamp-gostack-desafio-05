import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: null,
    placeholder: 'Adicione um repositório',
  };

  // Get data from localStorage
  componentDidMount () {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) })
    }
  }

  // Save update in the localStorage
  componentDidUpdate (_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories )
      localStorage.setItem('repositories', JSON.stringify(repositories));

  }


  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    try {
      const { newRepo, repositories  } = this.state;

      const hasRepo = repositories.find(r => r.name === newRepo);

      if (hasRepo) throw new Error('Repositório duplicado');

      if ( newRepo === '' ) throw new Error('Requisição vazia');

      const response = await api.get(`/repos/${newRepo}`)

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
      });
    }

    catch (err) {
      if ( err.message === 'Repositório duplicado') {
        this.setState({
          error: true,
          placeholder: 'Repositório duplicado',
          newRepo: '',
        });
      }

      if ( err.message === 'Requisição vazia') {
        this.setState({
          error: true,
          placeholder: 'Digite um repositório valido',
          newRepo: '',
        });
      }

      if (err.response && err.response.status === 404) {
        this.setState({
          error: true,
          placeholder: 'Repositório não encontrado',
          newRepo: '',
        });
      }
    }

    finally {
      this.setState({ loading: false });
    }

  };

  render() {
    const { newRepo, repositories, loading, error, placeholder } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            type="text"
            placeholder={placeholder}
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading}>
            { loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List >
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>Detalhes</Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
