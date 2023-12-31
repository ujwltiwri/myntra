import React, { useEffect, useState } from 'react'
import { Button, Label, Modal, Radio, TextInput } from 'flowbite-react'
import client from '../../../../apollo'
import CREATE_ADDRESS_MUTATION from './UserAddressMutation.gql'
import GET_ADDRESS_QUERY from './UserAddressQuery.gql'
import { gql, useQuery } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import SelectedRadio from '../../../../public/icons/SelectedRadio'
import NotSelectedRadio from '../../../../public/icons/NotSelectedRadio'
import Loader from '@/components/Loader/Loader'
import Image from 'next/image'

const Index = ({ route }) => {
  const { user } = useSelector((state) => state.user)
  const [openModal, setOpenModal] = useState('')
  const [addresses, setAddresses] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm()
  const { data, loading, error, refetch } = useQuery(GET_ADDRESS_QUERY, {
    variables: { userId: user.id },
  })

  // console.log('loading', loading)
  // console.log('error', error)
  // console.log('data', data)
  // console.log('addresses', addresses)
  console.log('selectedAddress', selectedAddress)

  useEffect(() => {
    if (data) {
      setAddresses([...data.addresses])
    }
  }, [data])

  const onSubmit = (data) => {
    console.log(data)
  } // your form submit function which will invoke after successful validation

  const handleAddressCreation = async (data) => {
    console.log('handleAddressCreation called')
    const { name, mobile, pincode, state, street_address, locality, city } =
      data

    try {
      const result = await client.mutate({
        mutation: CREATE_ADDRESS_MUTATION,
        variables: {
          city,
          locality,
          mobile,
          name,
          pincode,
          state,
          street_address,
          user_id: user.id,
        },
      })
      console.log('result', result)
      const {
        data: { insert_addresses_one },
      } = result

      console.log('address created', insert_addresses_one)

      const UPDATE_USER_ADDRESS_MUTATION = gql`
        mutation UpdateUserAddress($userId: uuid!, $newAddress: jsonb!) {
          update_users_by_pk(
            pk_columns: { id: $userId }
            _append: { addresses: $newAddress }
          ) {
            id
            addresses
          }
        }
      `

      const userResult = await client.mutate({
        mutation: UPDATE_USER_ADDRESS_MUTATION,
        variables: {
          userId: user.id,
          newAddress: insert_addresses_one.address_id,
        },
      })

      console.log('userResult', userResult)
      setOpenModal(undefined)
      reset() // resets form inputs
      refetch() // refetches the graphql data
      setAddresses([...data.addresses])
    } catch (err) {
      console.log('error while creating address', err)
    }
  }

  return (
    <>
      {loading ? (
        <div className='flex h-[100vh] w-[100vh] items-center justify-center'>
          <Loader />
        </div>
      ) : (
        <div className='flex justify-center'>
          <div
            className={`${
              route === 'checkout' ? 'w-[90%] max-w-[1640px] mt-8' : 'w-[640px]'
            } ${
              route === 'checkout' && 'flex flex-col'
            } max-w-screen-lg	mt-2 mx-4 my-3`}
          >
            <div className='flex justify-between w-full md:w-[150%]'>
              <h6 className='font-semibold text-gray-900 text-[16px]'>
                {route === 'checkout'
                  ? 'Select Delivery Address'
                  : 'Saved Addresses'}
              </h6>
              <button
                onClick={() => setOpenModal('form-elements')}
                className='border-[1px] ml-12 border-gray-200 rounded text-[13px] font-semibold text-[#516CCF] h-[40px] w-[180px]'
              >
                + Add New Address
              </button>
            </div>
            {/* Single Address */}
            <p className='text-[12px] w-full md:w-[150%] font-semibold uppercase'>
              Default Address
            </p>
            {addresses?.map((address, idx) => (
              <div
                key={idx}
                className='address-accordion mb-12 w-full'
                onClick={() => setSelectedAddress(idx)}
              >
                <div className='p-[14px] flex'>
                  {route === 'checkout' && (
                    <div className='mr-4'>
                      {selectedAddress === idx ? (
                        <SelectedRadio fill={'#ff3f6c'} />
                      ) : (
                        <NotSelectedRadio />
                      )}
                    </div>
                  )}
                  <div>
                    <div className='flex justify-between'>
                      <p className='text-[13px] font-semibold'>
                        {address.name}
                      </p>
                      <p className='address-type font-light ml-4'>Home</p>
                    </div>
                    <div className='text-[12px] text-[#696e79] mt-2'>
                      <p>{address.street_address}</p>
                      <p>{address.locality}</p>
                      <p>
                        {address.city} - {address.pincode}
                      </p>
                      <p>{address.state}</p>

                      <p className='mt-2'>Mobile: {address.mobile}</p>
                    </div>
                  </div>
                </div>
                <hr class='h-px mt-4 bg-gray-200 border-0 dark:bg-gray-700' />
                <div className='flex gap-1'>
                  <button className='w-full h-[44px] font-semibold text-[13px] text-[#526cd0] uppercase'>
                    Edit
                  </button>
                  <button className='w-full font-semibold text-[13px] text-[#526cd0] uppercase'>
                    Remove
                  </button>
                </div>
              </div>
              // </div>
            ))}
            {/* Single Address */}

            {/* Add Address Modal */}
            <Modal
              show={openModal === 'form-elements'}
              size='md'
              popup
              onClose={() => setOpenModal(undefined)}
            >
              <Modal.Header />
              <Modal.Body>
                <div className='space-y-6'>
                  <h3 className='text-sm font-medium text-gray-900 dark:text-white'>
                    Add New Address
                  </h3>
                  <form onSubmit={handleSubmit(handleAddressCreation)}>
                    <div>
                      <div className='mb-2 block'></div>
                      <TextInput
                        id='name'
                        placeholder='Name *'
                        {...register('name')}
                      />
                    </div>
                    <div>
                      <div className='mb-2 block'></div>
                      <TextInput
                        id='mobile'
                        type='text'
                        placeholder='Mobile *'
                        {...register('mobile')}
                      />
                    </div>
                    <div>
                      <div className='mb-2 block'></div>
                      <TextInput
                        id='pincode'
                        type='text'
                        placeholder='Pin Code *'
                        {...register('pincode')}
                      />
                    </div>
                    <div>
                      <div className='mb-2 block'></div>
                      <TextInput
                        id='state'
                        type='text'
                        placeholder='State *'
                        {...register('state')}
                      />
                    </div>
                    <div>
                      <div className='mb-2 block'></div>
                      <TextInput
                        id='street_address'
                        type='text'
                        placeholder='Address (House No, Building, Street, Area) *'
                        {...register('street_address')}
                      />
                    </div>
                    <div>
                      <div className='mb-2 block'></div>
                      <TextInput
                        id='locality'
                        type='text'
                        placeholder='Locality / Town *'
                        {...register('locality')}
                      />
                    </div>
                    <div>
                      <div className='mb-2 block'></div>
                      <TextInput
                        id='city'
                        type='text'
                        placeholder='City / District *'
                        {...register('city')}
                      />
                    </div>
                    <fieldset
                      className='flex max-w-md flex-col gap-4'
                      id='radio'
                    >
                      <legend className='mb-4'>
                        Choose your favorite country
                      </legend>
                      <div className='flex items-center'>
                        <Radio
                          defaultChecked
                          id='home'
                          name='addressType'
                          value='Home'
                          className='mr-2'
                        />
                        <Label htmlFor='united-state'>Home</Label>
                        <Radio
                          defaultChecked
                          id='office'
                          name='addressType'
                          value='Office'
                          className='ml-10 mr-2'
                        />
                        <Label htmlFor='united-state'>Office</Label>
                      </div>
                    </fieldset>

                    <div className='flex justify-between gap-1 mt-2'>
                      <Button
                        color='light'
                        className='w-full uppercase'
                        onClick={() => setOpenModal(undefined)}
                      >
                        Cancel
                      </Button>
                      {/* <Button
                color='gray'
                style={{ background: '#BFC0C5', color: '#fff' }}
                className='w-full uppercase'
                onClick={() => handleAddressCreation()}
              >
                Save
              </Button> */}
                      <input
                        type='submit'
                        className='w-full uppercase rounded-md'
                        style={{ background: '#BFC0C5', color: '#fff' }}
                      />
                    </div>
                  </form>
                </div>
              </Modal.Body>
            </Modal>
            {/* Add Address Modal */}
          </div>
        </div>
      )}
    </>
  )
}

export default Index
