import React from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

import ErrorMessage from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';

const possiblePermissions = [
	'ADMIN',
	'USER',
	'ITEMCREATE',
	'ITEMUPDATE',
	'ITEMDELETE',
	'PERMISSIONUPDATE'
];

const ALL_USERS_QUERY = gql`
	query {
		users {
			id 
			name 
			email 
			permissions 
		}
	}
`;

const UPDATE_PERMISSIONS_MUTATION = gql`
	mutation updatePermissions($permissions: [Permission], $userId: ID!) {
		updatePermissions(permissions: $permissions, userId: $userId) {
			id 
			permissions 
			name 
			email 
		}
	}
`;

const Permissions = props => (
	<Query query={ ALL_USERS_QUERY }>
		{
			({ data, loading, error }) => (
				<React.Fragment>
					<ErrorMessage error={ error } />
					<div>
						<h2>Manage Permissions</h2>
						<Table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Email</th>
									{
										possiblePermissions.map((permission) => <th key={ permission }>{ permission }</th>)
									}
									<th>&darr;</th>
								</tr>
							</thead>
							<tbody>
								{ 
									data.users.map((user) => (
										<UserPermissions user={ user } key={ user.id }/>
									))
								}
							</tbody>
						</Table>
					</div>
				</React.Fragment>
			)
		}
	</Query>
);

class UserPermissions extends React.Component {

	static propTypes = {
		user: PropTypes.shape({
			name: PropTypes.string,
			email: PropTypes.string,
			id: PropTypes.string,
			permissions: PropTypes.array
		}).isRequired
	}

	state = {
		permissions: this.props.user.permissions 
	};

	handlePermissionChange = (e) => {
		const checkbox = e.target;
		let updatedPermissions = [...this.state.permissions];
		// - Figure out if we are adding or removing permission
		if (checkbox.checked) {
			updatedPermissions.push(checkbox.value);
		}
		else {
			updatedPermissions = updatedPermissions.filter((permission) => permission !== checkbox.value);
		}
		// - Update permissions in state to update the UI
		this.setState({ permissions: updatedPermissions });
	}

	render() {
		const { user } = this.props;
		return (
			<React.Fragment>
				<Mutation 
					mutation={ UPDATE_PERMISSIONS_MUTATION }
					variables={{
						permissions: this.state.permissions,
						userId: this.props.user.id
					}}
				>
					{
						(updatePermissions, { loading, error }) => (
							<React.Fragment>
								{ 
									error && 
									<tr>
										<td colspan='8'><ErrorMessage error={ error }/></td>
									</tr> 
								}
							  <tr>
									<td>{ user.name }</td>
									<td>{ user.email }</td>
									{
										possiblePermissions.map((permission) => (
											<td key={ permission }>
												<label htmlFor={ `${user.id}-permission-${permission}` }>
													<input 
														id={ `${user.id}-permission-${permission}` }
														type="checkbox"
														checked={ this.state.permissions.includes(permission)}
														value={ permission }
														onChange={ this.handlePermissionChange }
													/>
												</label>
											</td>
										))
									}
									<td>
										<SickButton
											type='button'
											disabled={ loading }
											onClick={ updatePermissions }
										>
											Updat{ loading ? 'ing' : 'e' }
										</SickButton>
									</td>
								</tr>
							</React.Fragment>
						)
					}
				</Mutation>
			</React.Fragment>
				
						
		);
	}
}

export default Permissions;




















