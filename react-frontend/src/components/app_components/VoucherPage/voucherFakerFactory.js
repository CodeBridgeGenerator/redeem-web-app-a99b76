
import { faker } from "@faker-js/faker";
export default (user,count) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
voucherId: faker.lorem.sentence(1),
categoryId: faker.lorem.sentence(1),
userId: faker.lorem.sentence(1),
points: faker.lorem.sentence(1),
title: faker.lorem.sentence(1),
image: faker.lorem.sentence(1),
description: faker.lorem.sentence(1),
termsAndCondition: faker.lorem.sentence(1),
isLatest: faker.lorem.sentence(1),

updatedBy: user._id,
createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
