// --- thêm/ref dùng lại ---
const lastHydratedJSON = useRef<string | null>(null);
const isHydratingRef = useRef(false);
// bạn đã có lastEmittedRef rồi, tận dụng luôn
const prevProvinceRef = useRef<string | null>(null);

// ===== Hydrate khi value đổi (SỬA effect [value]) =====
useEffect(() => {
  if (!value) {
    hasHydrated.current = false;
    lastHydratedJSON.current = null;
    isHydratingRef.current = false;
    prevProvinceRef.current = null;
    setSelectedProvince('');
    setSelectedWard('');
    setProvinceSearch('');
    setWardSearch('');
    setStreet('');
    setSpecificAddress('');
    setShowSpecificAddress(false);
    setAdditionalInfo('');
    return;
  }

  const incoming = JSON.stringify(value);

  // 1) Nếu value chính là cái mình vừa emit -> bỏ qua, tránh “echo”
  if (incoming === lastEmittedRef.current) return;

  // 2) Nếu value giống lần hydrate trước -> bỏ qua
  if (incoming === lastHydratedJSON.current) return;

  isHydratingRef.current = true;
  hasHydrated.current = true;
  lastHydratedJSON.current = incoming;

  const provinceChanged = value.provinceCode !== prevProvinceRef.current;

  // --- luôn sync các field text ---
  if (value.street !== undefined) setStreet(value.street || '');
  if (value.specificAddress !== undefined) setSpecificAddress(value.specificAddress || '');
  setShowSpecificAddress(!!value.showSpecificAddress);
  if (value.additionalInfo !== undefined) setAdditionalInfo(value.additionalInfo || '');

  // --- sync province/name (chỉ set khi đổi để tránh rerender thừa) ---
  if (provinceChanged) {
    setSelectedProvince(value.provinceCode || '');
    setProvinceSearch(value.provinceName || '');
  }

  // --- ward: nếu đổi province thì mới load wards; nếu không, chỉ sync text ---
  if (provinceChanged && value.provinceCode) {
    (async () => {
      try {
        const ws = await addressService.getWardsByProvince(value.provinceCode!);
        setWards(ws);
        if (value.wardCode) {
          const found = ws.find(w => w.wardCode === value.wardCode);
          if (found) {
            setSelectedWard(found.wardCode);
            setWardSearch(found.wardName);
          } else {
            setSelectedWard('');
            setWardSearch(value.wardName || '');
          }
        } else {
          setSelectedWard('');
          setWardSearch(value.wardName || '');
        }
      } finally {
        prevProvinceRef.current = value.provinceCode || null;
        isHydratingRef.current = false;
      }
    })();
  } else {
    // province không đổi: đừng đụng network, chỉ đồng bộ ward text nếu có
    if (value.wardName !== undefined) setWardSearch(value.wardName || '');
    if (value.wardCode !== undefined) setSelectedWard(value.wardCode || '');
    isHydratingRef.current = false;
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [value]);

// ===== Emit (giữ như cũ nhưng thêm guard không emit khi đang hydrate) =====
useEffect(() => {
  if (isHydratingRef.current) return;

  const provinceObj = selectedProvince ? provinces.find(p => p.provinceCode === selectedProvince) : undefined;
  const wardObj = selectedWard ? wards.find(w => w.wardCode === selectedWard) : undefined;

  const provinceName = provinceObj?.provinceName || provinceSearch || '';
  const wardNameOut = wardObj?.wardName || wardSearch || '';
  const wardCodeOut = selectedWard || '';

  let emitted: Address | null = null;
  if (selectedProvince && (!showWard || wardNameOut)) {
    emitted = {
      street: street || '',
      ward: wardNameOut,
      city: provinceName,
      specificAddress: specificAddress || undefined,
      showSpecificAddress,
      provinceCode: selectedProvince,
      provinceName,
      wardCode: wardCodeOut,
      wardName: wardNameOut,
      additionalInfo: additionalInfo || undefined,
    };
  }

  const serialized = emitted ? JSON.stringify(emitted) : 'null';

  // Nếu giống y bản đã hydrate gần nhất -> khỏi emit, tránh ping-pong
  if (serialized !== 'null' && serialized === lastHydratedJSON.current) {
    lastEmittedRef.current = serialized;
    return;
  }

  if (emitted && (hasHydrated.current)) {
    if (lastEmittedRef.current !== serialized) {
      lastEmittedRef.current = serialized;
      onChange(emitted);
    }
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  selectedProvince,
  selectedWard,
  street,
  specificAddress,
  showSpecificAddress,
  additionalInfo,
  showWard,
  provinces,
  wards,
  provinceSearch,
  wardSearch,
]);
Vì sao hết nhấp-nháy?

Gõ “số nhà/tên đường” chỉ đổi text → value phản hồi từ cha sẽ không kích hoạt fetch wards nữa (province không đổi).

Bản phản hồi đúng bằng cái bạn vừa emit thì bỏ qua hydrate luôn, không reset dropdown → dropdown phường không còn “chớp”.