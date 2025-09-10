# AddressSelector Component

## Mô tả
Component AddressSelector cho phép người dùng chọn địa chỉ từ danh sách tỉnh/thành phố và phường/xã được cung cấp bởi API.

## Tính năng
- ✅ Dropdown chọn tỉnh/thành phố
- ✅ Dropdown chọn phường/xã (tự động load theo tỉnh đã chọn)
- ✅ Input nhập tên đường
- ✅ Input nhập số nhà với checkbox hiển thị
- ✅ Textarea thông tin bổ sung
- ✅ Preview địa chỉ đã chọn
- ✅ Validation đầy đủ

## Cách sử dụng

```tsx
import AddressSelector from '../common/AddressSelector';
import { Address } from '../../services/address';

function MyForm() {
  const [address, setAddress] = useState<Address | null>(null);

  return (
    <AddressSelector
      value={address}
      onChange={setAddress}
      className="my-custom-class"
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `Address \| null` | ✅ | Giá trị địa chỉ hiện tại |
| `onChange` | `(address: Address \| null) => void` | ✅ | Callback khi địa chỉ thay đổi |
| `className` | `string` | ❌ | CSS class tùy chỉnh |

## Address Interface

```typescript
interface Address {
  street: string;
  ward: string;
  district: string;
  city: string;
  houseNumber?: string;
  showHouseNumber?: boolean;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  additionalInfo?: string;
}
```

## API Integration

Component sử dụng `addressService` để gọi API:

```typescript
// Lấy danh sách tỉnh
const provinces = await addressService.getProvinces();

// Lấy danh sách phường theo tỉnh
const wards = await addressService.getWardsByProvince('01');

// Format địa chỉ để hiển thị
const displayText = addressService.formatAddressForDisplay(address);
```

## Validation

- Tỉnh/thành phố: Bắt buộc
- Phường/xã: Bắt buộc
- Tên đường: Bắt buộc
- Số nhà: Tùy chọn
- Thông tin bổ sung: Tùy chọn

## Styling

Component sử dụng Tailwind CSS với các class:
- `space-y-4`: Khoảng cách giữa các field
- `w-full`: Chiều rộng đầy đủ
- `px-3 py-2`: Padding cho input
- `border border-gray-300`: Border cho input
- `focus:ring-2 focus:ring-teal-500`: Focus state
- `disabled:bg-gray-100`: Disabled state

## Example

```tsx
// Trong form tạo bài đăng
<AddressSelector
  value={formData.address}
  onChange={(address) => setFormData({ ...formData, address })}
  className="mb-6"
/>
```

## Notes

- Component tự động load danh sách tỉnh khi mount
- Khi chọn tỉnh, danh sách phường sẽ được load tự động
- Khi địa chỉ đầy đủ, `onChange` sẽ được gọi với object Address hoàn chỉnh
- Component hỗ trợ backward compatibility với dữ liệu cũ
