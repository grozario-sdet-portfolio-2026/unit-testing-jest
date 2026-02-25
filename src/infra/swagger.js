const swaggerJsdoc = require('swagger-jsdoc')

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restaurant Booking System API',
      version: '1.0.0',
      description: 'A comprehensive REST API for managing restaurant bookings with geolocation features',
      contact: {
        name: 'Development Team',
        url: 'https://github.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Restaurant: {
          type: 'object',
          required: ['name', 'address', 'latitude', 'longitude'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the restaurant'
            },
            name: {
              type: 'string',
              description: 'Name of the restaurant'
            },
            address: {
              type: 'string',
              description: 'Full address of the restaurant'
            },
            latitude: {
              type: 'number',
              format: 'float',
              description: 'Latitude coordinate'
            },
            longitude: {
              type: 'number',
              format: 'float',
              description: 'Longitude coordinate'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
        },
        Reservation: {
          type: 'object',
          required: ['restaurant_id', 'customer_name', 'customer_phone', 'reservation_date', 'reservation_time', 'number_of_people'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the reservation'
            },
            restaurant_id: {
              type: 'integer',
              description: 'Restaurant ID'
            },
            customer_name: {
              type: 'string',
              description: 'Customer name'
            },
            customer_phone: {
              type: 'string',
              description: 'Customer phone number'
            },
            reservation_date: {
              type: 'string',
              format: 'date',
              description: 'Reservation date (YYYY-MM-DD)'
            },
            reservation_time: {
              type: 'string',
              format: 'time',
              description: 'Reservation time (HH:mm)'
            },
            number_of_people: {
              type: 'integer',
              description: 'Number of people'
            },
            status: {
              type: 'string',
              enum: ['confirmed', 'cancelled'],
              description: 'Reservation status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error type'
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health Check',
        description: 'API health check endpoint'
      },
      {
        name: 'Restaurants',
        description: 'Restaurant management operations'
      },
      {
        name: 'Reservations',
        description: 'Reservation management operations'
      }
    ],
    paths: {
      '/': {
        get: {
          tags: ['Health Check'],
          summary: 'Health check endpoint',
          description: 'Verify API is running',
          responses: {
            200: {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Server is running'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/restaurants': {
        get: {
          tags: ['Restaurants'],
          summary: 'List all restaurants',
          description: 'Retrieve all restaurants from the database',
          responses: {
            200: {
              description: 'List of restaurants',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean'
                      },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Restaurant'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Restaurants'],
          summary: 'Create a new restaurant',
          description: 'Add a new restaurant to the system',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Restaurant'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Restaurant created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean'
                      },
                      data: {
                        $ref: '#/components/schemas/Restaurant'
                      },
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Invalid input',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/restaurants/{id}': {
        get: {
          tags: ['Restaurants'],
          summary: 'Get restaurant by ID',
          description: 'Retrieve a specific restaurant using its ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              },
              description: 'Restaurant ID'
            }
          ],
          responses: {
            200: {
              description: 'Restaurant found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean'
                      },
                      data: {
                        $ref: '#/components/schemas/Restaurant'
                      }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Restaurant not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        put: {
          tags: ['Restaurants'],
          summary: 'Update restaurant',
          description: 'Update an existing restaurant',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Restaurant'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Restaurant updated successfully'
            },
            400: {
              description: 'Invalid input'
            },
            404: {
              description: 'Restaurant not found'
            }
          }
        },
        delete: {
          tags: ['Restaurants'],
          summary: 'Delete restaurant',
          description: 'Remove a restaurant from the system',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              }
            }
          ],
          responses: {
            200: {
              description: 'Restaurant deleted successfully'
            },
            404: {
              description: 'Restaurant not found'
            }
          }
        }
      },
      '/api/restaurants/nearby': {
        get: {
          tags: ['Restaurants'],
          summary: 'Search nearby restaurants',
          description: 'Find restaurants near given coordinates using LocationIQ',
          parameters: [
            {
              name: 'latitude',
              in: 'query',
              required: true,
              schema: {
                type: 'number'
              },
              description: 'Latitude coordinate'
            },
            {
              name: 'longitude',
              in: 'query',
              required: true,
              schema: {
                type: 'number'
              },
              description: 'Longitude coordinate'
            },
            {
              name: 'radiusKilometers',
              in: 'query',
              required: true,
              schema: {
                type: 'number'
              },
              description: 'Search radius in kilometers'
            }
          ],
          responses: {
            200: {
              description: 'List of nearby restaurants'
            },
            400: {
              description: 'Invalid parameters'
            }
          }
        }
      },
      '/api/reservations': {
        post: {
          tags: ['Reservations'],
          summary: 'Create a new reservation',
          description: 'Book a table at a restaurant',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Reservation'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Reservation created successfully'
            },
            400: {
              description: 'Invalid input or table not available'
            }
          }
        },
        get: {
          tags: ['Reservations'],
          summary: 'List all reservations',
          description: 'Retrieve all reservations with optional filtering',
          parameters: [
            {
              name: 'restaurant_id',
              in: 'query',
              required: false,
              schema: {
                type: 'integer'
              },
              description: 'Filter by restaurant ID'
            }
          ],
          responses: {
            200: {
              description: 'List of reservations'
            }
          }
        }
      },
      '/api/reservations/{id}': {
        get: {
          tags: ['Reservations'],
          summary: 'Get reservation by ID',
          description: 'Retrieve a specific reservation',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              }
            }
          ],
          responses: {
            200: {
              description: 'Reservation found'
            },
            404: {
              description: 'Reservation not found'
            }
          }
        },
        put: {
          tags: ['Reservations'],
          summary: 'Update reservation',
          description: 'Modify an existing reservation',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Reservation'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Reservation updated successfully'
            },
            400: {
              description: 'Invalid input'
            },
            404: {
              description: 'Reservation not found'
            }
          }
        },
        delete: {
          tags: ['Reservations'],
          summary: 'Cancel reservation',
          description: 'Cancel an existing reservation',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              }
            }
          ],
          responses: {
            200: {
              description: 'Reservation cancelled successfully'
            },
            404: {
              description: 'Reservation not found'
            }
          }
        }
      }
    }
  },
  apis: []
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

module.exports = swaggerSpec
